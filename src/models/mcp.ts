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

            // 匹配相关账户 - 使用更精确的域名匹配
            const matchedEntries = this.getMatchedEntriesByDomain(domain, entries);

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
     * 使用更精确的域名匹配逻辑
     * @param domain 完整域名
     * @param entries 所有账户
     * @returns 匹配的账户列表
     */
    private getMatchedEntriesByDomain(domain: string, entries: any[]): any[] {
        const matched = [];
        const domainLower = domain.toLowerCase();
        const siteName = this.getSiteNameFromDomain(domain).toLowerCase();

        for (const entry of entries) {
            if (!entry.issuer) {
                continue;
            }

            const issuerLower = entry.issuer.toLowerCase();

            // 1. 完全匹配域名
            if (issuerLower === domainLower || issuerLower === `www.${domainLower}`) {
                matched.push({ ...entry, matchScore: 3 });
                continue;
            }

            // 2. 匹配站点名称
            if (issuerLower === siteName) {
                matched.push({ ...entry, matchScore: 2 });
                continue;
            }

            // 3. 域名包含issuer
            if (domainLower.includes(issuerLower) || issuerLower.includes(domainLower)) {
                matched.push({ ...entry, matchScore: 1 });
                continue;
            }

            // 4. 站点名称包含issuer
            if (siteName && issuerLower.includes(siteName)) {
                matched.push({ ...entry, matchScore: 1 });
                continue;
            }
        }

        // 按匹配分数排序，返回最佳匹配
        if (matched.length > 0) {
            matched.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            return matched.map(e => {
                const { matchScore, ...rest } = e;
                return rest;
            });
        }

        return [];
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
