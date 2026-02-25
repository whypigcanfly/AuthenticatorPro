import { MCP, MCPResult } from "./models/mcp";

/**
 * MCP API 接口
 * 提供获取指定域名MFA验证码的功能
 */

/**
 * 获取指定域名的MFA验证码
 * @param domain 网站域名
 * @param passphrase 可选的密码短语，用于解锁加密账户
 * @param keyId 可选的密钥ID，用于解锁加密账户
 * @returns Promise<MCPResult> 包含验证码或错误信息
 */
export async function getMfaForDomain(
  domain: string,
  passphrase?: string,
  keyId?: string
): Promise<MCPResult> {
  try {
    const mcp = new MCP(passphrase, keyId);
    return await mcp.getMfaForDomain(domain);
  } catch (error) {
    console.error("MCP API error:", error);
    return {
      success: false,
      error: "Internal API error"
    };
  }
}

/**
 * 批量获取多个域名的MFA验证码
 * @param domains 网站域名数组
 * @param passphrase 可选的密码短语，用于解锁加密账户
 * @param keyId 可选的密钥ID，用于解锁加密账户
 * @returns Promise<Map<string, MCPResult>> 域名到验证码结果的映射
 */
export async function getMfaForDomains(
  domains: string[],
  passphrase?: string,
  keyId?: string
): Promise<Map<string, MCPResult>> {
  const results = new Map<string, MCPResult>();
  const mcp = new MCP(passphrase, keyId);

  for (const domain of domains) {
    try {
      const result = await mcp.getMfaForDomain(domain);
      results.set(domain, result);
    } catch (error) {
      console.error(`MCP API error for domain ${domain}:`, error);
      results.set(domain, {
        success: false,
        error: "Internal API error"
      });
    }
  }

  return results;
}
