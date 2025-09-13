import AsyncStorage from '@react-native-async-storage/async-storage';
export interface NetworkToken {
  id: string; // unique id for list keys
  symbol: string;
  name: string;
  priceUSDT: number;
  changePct24h: number; // percentage
  color: string; // for placeholder icon
  iconUrl?: string; // network logo url if available
}

export default class TokenService {
  static CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  private static getCacheKey(network: string, limit: number) {
    return `token_cache_${network}_${limit}`;
  }

  static async fetchTokensCached(network: string = 'ethereum', limit: number = 100): Promise<NetworkToken[]> {
    const cacheKey = this.getCacheKey(network, limit);
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.tokens) && typeof parsed.ts === 'number') {
          const fresh = Date.now() - parsed.ts < this.CACHE_TTL_MS;
          if (fresh) {
            return parsed.tokens as NetworkToken[];
          }
        }
      }
    } catch {}

    const tokens = await this.fetchTokens(network, limit);
    if (tokens && tokens.length) {
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), tokens }));
      } catch {}
    }
    return tokens;
  }
  static async getCachedTokens(network: string = 'ethereum', limit: number = 100): Promise<NetworkToken[]> {
    try {
      const cached = await AsyncStorage.getItem(this.getCacheKey(network, limit));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.tokens)) return parsed.tokens as NetworkToken[];
      }
    } catch {}
    return [];
  }
  static async fetchTokens(network: string = 'ethereum', limit: number = 100): Promise<NetworkToken[]> {
    // Strategy:
    // 1) Try CoinGecko global markets endpoint (cross-network, real prices)
    // 2) Fallback to network token list enrichment
    // 3) Fallback to default static set
    try {
      const pages = Math.ceil(limit / 100);
      const out: NetworkToken[] = [];
      for (let page = 1; page <= pages; page += 1) {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=24h`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('coingecko markets failed');
        const json = await resp.json();
        for (const item of json) {
          out.push({
            id: item.id || `${item.symbol}-${item.name}`,
            symbol: (item.symbol || '').toUpperCase(),
            name: item.name || '',
            priceUSDT: typeof item.current_price === 'number' ? item.current_price : 0,
            changePct24h: typeof item.price_change_percentage_24h === 'number' ? Number(item.price_change_percentage_24h.toFixed(2)) : 0,
            color: '#4C6FFF',
            iconUrl: item.image,
          });
        }
      }
      if (out.length) return out.slice(0, limit);
    } catch (_err) {
      // Continue to fallback below
    }

    // Attempt Coingecko token list + price enrichment for popular EVM networks.
    // Fallback to DEFAULT_TOKENS on error.
    const coingeckoListSlug: Record<string, string> = {
      ethereum: 'uniswap',
      'polygon': 'polygon-pos',
      'polygon-pos': 'polygon-pos',
      bsc: 'binance-smart-chain',
      'binance-smart-chain': 'binance-smart-chain',
      arbitrum: 'arbitrum-one',
      'arbitrum-one': 'arbitrum-one',
      optimism: 'optimistic-ethereum',
      'optimistic-ethereum': 'optimistic-ethereum',
      avalanche: 'avalanche',
      fantom: 'fantom',
    };

    try {
      const slug = coingeckoListSlug[network] || 'uniswap';
      const listUrl = `https://tokens.coingecko.com/${slug}/all.json`;
      const listResp = await fetch(listUrl);
      const listJson = await listResp.json();
      const items: any[] = Array.isArray(listJson?.tokens) ? listJson.tokens.slice(0, limit) : [];
      if (items.length === 0) return [];

      // Build price query per Coingecko "simple/token_price" endpoint
      const platformId = slug; // matches coingecko platform id
      const addresses: string[] = items.map((t) => t.address).filter(Boolean);

      const batch = (arr: string[], size: number) => arr.reduce((acc: string[][], _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
      const addressBatches = batch(addresses, 100);

      const priceMap: Record<string, { usd?: number; usd_24h_change?: number }> = {};
      for (const group of addressBatches) {
        const url = `https://api.coingecko.com/api/v3/simple/token_price/${platformId}?contract_addresses=${group.join(',')}&vs_currencies=usd&include_24hr_change=true`;
        const resp = await fetch(url);
        const json = await resp.json();
        Object.assign(priceMap, json);
      }

      const enriched: NetworkToken[] = items.map((t) => {
        const priceInfo = priceMap[(t.address || '').toLowerCase()] || {};
        return {
          id: (t.address || `${t.symbol}-${t.name}`).toLowerCase(),
          symbol: t.symbol,
          name: t.name,
          priceUSDT: typeof priceInfo.usd === 'number' ? priceInfo.usd : 0,
          changePct24h: typeof priceInfo.usd_24h_change === 'number' ? Number(priceInfo.usd_24h_change.toFixed(2)) : 0,
          color: '#4C6FFF',
          iconUrl: t.logoURI || t.logoUrl,
        } as NetworkToken;
      });

      return enriched.length ? enriched : [];
    } catch (_e) {
      return [];
    }
  }

  static async fetchTokensByIds(ids: string[], vs: string = 'usd'): Promise<NetworkToken[]> {
    if (!ids || !ids.length) return [];
    try {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&ids=${ids.join(',')}&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=false&price_change_percentage=24h`;
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const json = await resp.json();
      return (json || []).map((item: any) => ({
        id: item.id || `${item.symbol}-${item.name}`,
        symbol: (item.symbol || '').toUpperCase(),
        name: item.name || '',
        priceUSDT: typeof item.current_price === 'number' ? item.current_price : 0,
        changePct24h: typeof item.price_change_percentage_24h === 'number' ? Number(item.price_change_percentage_24h.toFixed(2)) : 0,
        color: '#4C6FFF',
        iconUrl: item.image,
      })) as NetworkToken[];
    } catch {
      return [];
    }
  }
  static async fetchTokensByIds(ids: string[], vs: string = 'usd'): Promise<NetworkToken[]> {
    if (!ids || !ids.length) return [];
    try {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&ids=${ids.join(',')}&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=false&price_change_percentage=24h`;
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const json = await resp.json();
      return (json || []).map((item: any) => ({
        id: item.id || `${item.symbol}-${item.name}`,
        symbol: (item.symbol || '').toUpperCase(),
        name: item.name || '',
        priceUSDT: typeof item.current_price === 'number' ? item.current_price : 0,
        changePct24h: typeof item.price_change_percentage_24h === 'number' ? Number(item.price_change_percentage_24h.toFixed(2)) : 0,
        color: '#4C6FFF',
        iconUrl: item.image,
      })) as NetworkToken[];
    } catch {
      return [];
    }
  }
}


