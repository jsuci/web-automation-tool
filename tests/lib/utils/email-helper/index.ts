import sgMail from "@sendgrid/mail";
import axios from "axios";

interface SendMailProps {
  emailTo: string;
  emailFrom: string;
  subject: string;
  text: string;
  html: string | "";
}

interface CheckMailProps {
  eventType: string;
  email: string; //the email address of the recipient
  attempts?: number;
  lastChecked?: Date;
}

async function sendMail({
  emailTo,
  emailFrom,
  subject,
  text,
  html,
}: SendMailProps) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const msg = {
    to: emailTo,
    from: emailFrom,
    subject,
    text,
    html,
  };

  await sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
}

async function checkMail({ eventType, email }: CheckMailProps) {
  const emailReponse = await axios.get(
    "https://incandescent-lebkuchen-43964a.netlify.app/api/sendgrid"
  );
  const allEmails = emailReponse.data;

  const filteredMail = allEmails.filter((item: any) => {
    if (item.event === eventType && item.email === email) {
      return item;
    }
  });

  return filteredMail;
}

async function deleteMail() {
  const emailReponse = await axios.delete(
    "https://incandescent-lebkuchen-43964a.netlify.app/api/sendgrid"
  );

  return emailReponse.status === 202;
}

const maxAttempts = 10;
const delayBetweenAttempts = 5000; // in milliseconds

async function pollForEmail({
  eventType,
  email,
  attempts = 0,
}: CheckMailProps) {
  const result = await checkMail({ eventType, email });

  if (result.length === 0) {
    console.log("check email status again...");
    await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
    return pollForEmail({
      eventType,
      email,
      attempts: attempts + 1,
    });
  } else {
    console.log("email found: ", result);
    return result;
  }
}

export { sendMail, checkMail, pollForEmail, deleteMail };
