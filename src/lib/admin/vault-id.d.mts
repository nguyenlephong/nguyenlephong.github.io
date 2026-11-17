export declare const ADMIN_VAULT_SALT: string
export declare const ADMIN_VAULT_ITERATIONS: number
export declare const ADMIN_VAULT_COLLECTION: 'adminVault'

export declare function isAdminVaultId(value: unknown): value is string

export declare function deriveAdminVaultId(password: string, subtle?: SubtleCrypto): Promise<string>
