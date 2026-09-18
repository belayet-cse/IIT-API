export declare function isSslcommerzConfigured(): boolean;
export interface InitiateSslcommerzParams {
    tranId: string;
    totalAmount: number;
    currency: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    productName: string;
}
export declare function initiateSslcommerzPayment(params: InitiateSslcommerzParams): Promise<string>;
export interface SslcommerzValidationResult {
    valid: boolean;
    status?: string;
    amount?: string;
    currency?: string;
    bankTranId?: string;
}
export declare function validateSslcommerzPayment(valId: string): Promise<SslcommerzValidationResult>;
