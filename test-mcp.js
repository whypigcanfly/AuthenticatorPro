// 简单的MCP功能测试脚本
const { getMfaForDomain } = require('./src/mcp.ts');
const { extractSiteNameFromDomain } = require('./src/utils.ts');

console.log('=== MCP功能测试 ===\n');

// 测试域名解析功能
console.log('1. 域名解析测试:');
const testDomains = [
  'example.com',
  'www.example.com',
  'subdomain.example.com',
  'example.com/path',
  'example.com:8080',
  'https://example.com',
  'example.co.uk',
  'example.com.cn',
  '',
  'localhost'
];

testDomains.forEach(domain => {
  try {
    const result = extractSiteNameFromDomain(domain);
    console.log(`  ${domain} → ${result}`);
  } catch (error) {
    console.log(`  ${domain} → 错误: ${error.message}`);
  }
});

// 测试MCP API
console.log('\n2. MCP API测试:');
const testMcpDomains = ['google.com', 'example.com', ''];

testMcpDomains.forEach(async domain => {
  try {
    console.log(`  测试域名: ${domain}`);
    const result = await getMfaForDomain(domain);
    console.log(`  结果: ${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    console.log(`  错误: ${error.message}`);
  }
});

console.log('\n测试完成!');
