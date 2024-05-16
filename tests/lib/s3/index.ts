import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";

class S3 {
    client: S3Client;
    constructor() {
        this.client = new S3Client({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
    }
    
    async listBuckets() {
        const command = new ListBucketsCommand({});
        const response = await this.client.send(command);

        return response.Buckets;
    }

    async putObject(key: string, body: Buffer, contentType: string) {
        const bucket = process.env.S3_BUCKET || '';

        if (!bucket) {
            throw new Error('S3_BUCKET is not defined');
        }

        const command = new PutObjectCommand({
            // ACL: 'public-read',
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType
        });
        const response = await this.client.send(command);

        return response;
    }

    getObjectUrl(key: string) {
        const bucket = process.env.S3_BUCKET;

        if (!bucket) {
            throw new Error('S3_BUCKET is not defined');
        }

        const s3Url = `https://${bucket}.s3.amazonaws.com/${key}`;

        return encodeURI(s3Url);
    }
}

export default S3;