import { expect } from "chai";
import { MCP } from "../models/mcp";
import { extractSiteNameFromDomain } from "../utils";
import { getMfaForDomain } from "../mcp";

describe("MCP功能测试", () => {
  describe("域名解析功能", () => {
    it("应该正确解析简单域名", () => {
      expect(extractSiteNameFromDomain("example.com")).to.equal("example");
    });

    it("应该正确解析带www的域名", () => {
      expect(extractSiteNameFromDomain("www.example.com")).to.equal("example");
    });

    it("应该正确解析多级域名", () => {
      expect(extractSiteNameFromDomain("subdomain.example.com")).to.equal("example");
    });

    it("应该正确解析带路径的域名", () => {
      expect(extractSiteNameFromDomain("example.com/path")).to.equal("example");
    });

    it("应该正确解析带端口的域名", () => {
      expect(extractSiteNameFromDomain("example.com:8080")).to.equal("example");
    });

    it("应该正确解析带协议的域名", () => {
      expect(extractSiteNameFromDomain("https://example.com")).to.equal("example");
    });

    it("应该正确解析特殊二级域名", () => {
      expect(extractSiteNameFromDomain("example.co.uk")).to.equal("example");
      expect(extractSiteNameFromDomain("example.com.cn")).to.equal("example");
    });

    it("应该处理空域名", () => {
      expect(extractSiteNameFromDomain("")).to.equal("");
    });

    it("应该处理单个主机名", () => {
      expect(extractSiteNameFromDomain("localhost")).to.equal("localhost");
    });
  });

  describe("MCP类测试", () => {
    it("应该创建MCP实例", () => {
      const mcp = new MCP();
      expect(mcp).to.be.instanceof(MCP);
    });

    it("应该创建带认证信息的MCP实例", () => {
      const mcp = new MCP("test-passphrase", "test-key-id");
      expect(mcp).to.be.instanceof(MCP);
    });

    it("应该处理无效域名", async () => {
      const mcp = new MCP();
      const result = await mcp.getMfaForDomain("");
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe("MCP API测试", () => {
    it("应该调用getMfaForDomain API", async () => {
      const result = await getMfaForDomain("example.com");
      expect(result).to.have.property("success");
    });

    it("应该处理API错误", async () => {
      const result = await getMfaForDomain("");
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe("MCP功能集成测试", () => {
    it("应该处理真实域名请求", async () => {
      // 注意：这个测试可能会失败，因为没有实际的账户数据
      // 但它应该能够正确处理请求并返回适当的错误信息
      const result = await getMfaForDomain("google.com");
      expect(result).to.have.property("success");
      // 由于没有实际账户，应该返回错误
      expect(result.success).to.be.false;
    });
  });
});
