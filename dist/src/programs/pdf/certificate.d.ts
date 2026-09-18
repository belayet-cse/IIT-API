export interface CertificateData {
    learnerName: string;
    programTitle: string;
    completedAt: Date;
    referenceCode: string;
}
export declare function generateCertificatePdf(data: CertificateData): Promise<Buffer>;
