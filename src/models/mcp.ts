import { Encryption } from "./encryption";
import { OTPEntry, OTPType, OTPAlgorithm } from "./otp";
import { EntryStorage } from "./storage";
import { getMatchedEntries, extractSiteNameFromDomain } from "../utils";

export interface MCPResult {
    success: boolean;
    code?: string;
    account?: string;
    issuer?: string;
    error?: string;
}

export class MCP {
    private encryption: Encryption;

    constructor(passphrase?: string, keyId?: string) {
        this.encryption = new Encryption(passphrase || "", keyId || "");
    }

    /**
     * 获取指定域名的MFA验证码
     * @param domain 网站域名
     * @returns MCPResult 包含验证码或错误信息
     */
    async getMfaForDomain(domain: string): Promise<MCPResult> {
        try {
            // 验证域名格式
            if (!domain || typeof domain !== "string") {
                return {
                    success: false,
                    error: "Invalid domain format"
                };
            }

            // 构建站点信息数组，模拟getSiteName()的返回格式
            const siteName = [null, this.getSiteNameFromDomain(domain), domain];

            // 获取所有账户
            const entries = await EntryStorage.get();

            if (!entries || entries.length === 0) {
                return {
                    success: false,
                    error: "No accounts found"
                };
            }

            // 匹配相关账户
            const matchedEntries = getMatchedEntries(siteName, entries);

            if (!matchedEntries || matchedEntries.length === 0) {
                return {
                    success: false,
                    error: "No matching accounts found for this domain"
                };
            }

            // 检查加密状态
            const hasEncryptionKey = await EntryStorage.hasEncryptionKey();
            const encryptionStatus = this.encryption.getEncryptionStatus();

            if (hasEncryptionKey !== encryptionStatus) {
                return {
                    success: false,
                    error: "Encryption status mismatch. Please unlock the extension."
                };
            }

            // 对匹配的账户应用加密（如果需要）
            const processedEntries = matchedEntries.map(entry => {
                // 创建符合OTPEntry构造函数期望的条目对象
                const entryData = {
                    account: entry.account,
                    encrypted: hasEncryptionKey,
                    index: entry.index,
                    issuer: entry.issuer,
                    secret: entry.secret || "",
                    type: entry.type as OTPType,
                    counter: entry.counter,
                    period: entry.period,
                    hash: entry.hash,
                    digits: entry.digits,
                    algorithm: entry.algorithm as OTPAlgorithm,
                    pinned: entry.pinned
                };
                const otpEntry = new OTPEntry(entryData, this.encryption);
                if (hasEncryptionKey) {
                    otpEntry.applyEncryption(this.encryption);
                }
                return otpEntry;
            });

            // 过滤出有效的验证码
            const validEntries = processedEntries.filter(entry => {
                return entry.code !== "&bull;&bull;&bull;&bull;&bull;&bull;" &&
                    entry.code !== "-1" && // CodeState.Invalid
                    entry.code !== "-2";   // CodeState.Encrypted
            });

            if (validEntries.length === 0) {
                return {
                    success: false,
                    error: "No valid MFA codes found for this domain"
                };
            }

            // 返回第一个有效的验证码（可以根据需要实现更复杂的选择逻辑）
            const bestMatch = validEntries[0];

            return {
                success: true,
                code: bestMatch.code,
                account: bestMatch.account,
                issuer: bestMatch.issuer
            };

        } catch (error) {
            console.error("MCP error:", error);
            return {
                success: false,
                error: "Internal error while processing MCP request"
            };
        }
    }

    /**
   * 从域名中提取站点名称
   * @param domain 完整域名
   * @returns 提取的站点名称
   */
    private getSiteNameFromDomain(domain: string): string {
        return extractSiteNameFromDomain(domain);
    }
}
