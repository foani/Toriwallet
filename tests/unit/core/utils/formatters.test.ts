import * as formatters from '../../../../packages/core/src/utils/formatters';

describe('Formatters Utils', () => {
  test('should format ETH value to display string', () => {
    const wei = '1000000000000000000'; // 1 ETH
    const formattedEth = formatters.formatEthValue(wei);
    
    expect(formattedEth).toBe('1.0');
  });

  test('should format ETH with custom decimal places', () => {
    const wei = '1234567890123456789'; // 1.23456789... ETH
    const formattedEth4 = formatters.formatEthValue(wei, 4);
    const formattedEth6 = formatters.formatEthValue(wei, 6);
    
    expect(formattedEth4).toBe('1.2346');
    expect(formattedEth6).toBe('1.234568');
  });

  test('should format small ETH values correctly', () => {
    const wei = '1000000000000'; // 0.000001 ETH
    const formattedEth = formatters.formatEthValue(wei);
    
    expect(formattedEth).toBe('0.000001');
  });

  test('should format zero ETH value correctly', () => {
    const wei = '0';
    const formattedEth = formatters.formatEthValue(wei);
    
    expect(formattedEth).toBe('0.0');
  });

  test('should format token value', () => {
    const amount = '1000000000'; // 1 token with 9 decimals
    const decimals = 9;
    const formattedToken = formatters.formatTokenValue(amount, decimals);
    
    expect(formattedToken).toBe('1.0');
  });

  test('should format token with custom decimal places', () => {
    const amount = '123456789000'; // 123.456789 token with 9 decimals
    const decimals = 9;
    const formattedToken4 = formatters.formatTokenValue(amount, decimals, 4);
    const formattedToken6 = formatters.formatTokenValue(amount, decimals, 6);
    
    expect(formattedToken4).toBe('123.4568');
    expect(formattedToken6).toBe('123.456789');
  });

  test('should format small token values correctly', () => {
    const amount = '1000'; // 0.000001 token with 9 decimals
    const decimals = 9;
    const formattedToken = formatters.formatTokenValue(amount, decimals);
    
    expect(formattedToken).toBe('0.000001');
  });

  test('should format zero token value correctly', () => {
    const amount = '0';
    const decimals = 18;
    const formattedToken = formatters.formatTokenValue(amount, decimals);
    
    expect(formattedToken).toBe('0.0');
  });

  test('should format address for display', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const formatted = formatters.formatAddress(address);
    
    expect(formatted).toBe('0x1234...5678');
  });

  test('should format transaction hash for display', () => {
    const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const formatted = formatters.formatTransactionHash(txHash);
    
    expect(formatted).toBe('0x1234...cdef');
  });

  test('should format date', () => {
    const timestamp = 1622505600000; // 2021-06-01T00:00:00.000Z
    const formatted = formatters.formatDate(timestamp);
    
    // 결과는 로케일에 따라 다를 수 있어 정확한 값을 테스트하기 어려움
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  test('should format date with custom format', () => {
    const timestamp = 1622505600000; // 2021-06-01T00:00:00.000Z
    const formatted = formatters.formatDate(timestamp, 'YYYY-MM-DD');
    
    expect(formatted).toBe('2021-06-01');
  });

  test('should format relative time', () => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    
    const hourFormatted = formatters.formatRelativeTime(oneHourAgo);
    const dayFormatted = formatters.formatRelativeTime(oneDayAgo);
    
    expect(hourFormatted.includes('hour')).toBe(true);
    expect(dayFormatted.includes('day')).toBe(true);
  });

  test('should format fiat value', () => {
    const value = 1234.56;
    const currency = 'USD';
    
    const formatted = formatters.formatFiatValue(value, currency);
    
    expect(formatted).toBe('$1,234.56');
  });

  test('should format fiat value with custom options', () => {
    const value = 1234.56;
    const currency = 'EUR';
    const options = { maximumFractionDigits: 0 };
    
    const formatted = formatters.formatFiatValue(value, currency, options);
    
    expect(formatted).toBe('€1,235');
  });

  test('should format gas price', () => {
    const gasPrice = '20000000000'; // 20 Gwei
    const formatted = formatters.formatGasPrice(gasPrice);
    
    expect(formatted).toBe('20 Gwei');
  });

  test('should parse amount input correctly', () => {
    const input = '1.23';
    const decimals = 18;
    
    const parsed = formatters.parseAmountInput(input, decimals);
    
    expect(parsed).toBe('1230000000000000000');
  });

  test('should handle invalid amount input', () => {
    const input = 'invalid';
    const decimals = 18;
    
    expect(() => formatters.parseAmountInput(input, decimals)).toThrow();
  });
});
