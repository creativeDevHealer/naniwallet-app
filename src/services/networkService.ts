import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetworkChain {
	id: string;
	name: string;
	iconUrl?: string;
}

const CHAINS_CACHE_KEY = 'cached_network_chains_v4';
const CHAINS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default class NetworkService {
	static async fetchChains(): Promise<NetworkChain[]> {
		try {
			// Chainlist public dataset for EVM chains
			const resp = await fetch('https://chainid.network/chains.json');
			if (!resp.ok) throw new Error('failed chains.json');
			const json: any[] = await resp.json();

			// Fallback icon overrides by normalized name
			const ICON_OVERRIDES: Record<string, string> = {
				'ethereum': 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
				'bnb chain': 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
				'binance smart chain': 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
				'polygon': 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png',
				'arbitrum': 'https://assets.coingecko.com/coins/images/16547/thumb/arbitrum.png',
				'optimism': 'https://assets.coingecko.com/coins/images/25244/thumb/Optimism.png',
				'base': 'https://assets.coingecko.com/coins/images/31069/thumb/base-logo.png',
				'avalanche': 'https://assets.coingecko.com/coins/images/12559/thumb/coin-round-red.png',
				'fantom': 'https://assets.coingecko.com/coins/images/4001/thumb/Fantom_round.png',
				'gnosis': 'https://assets.coingecko.com/coins/images/15585/thumb/gnosis-gno-icon.png',
				'cronos': 'https://assets.coingecko.com/coins/images/7310/thumb/cro_token_logo.png',
				'zilliqa': 'https://assets.coingecko.com/coins/images/2687/thumb/Zilliqa-logo.png',
				'waves': 'https://assets.coingecko.com/coins/images/425/thumb/waves.png',
				'vechain': 'https://assets.coingecko.com/coins/images/1167/thumb/VET_512x512.png',
				'tron': 'https://assets.coingecko.com/coins/images/1094/thumb/tron-logo.png',
			};
			const out: NetworkChain[] = json.map((c) => {
				const id = typeof c.chainId === 'number' ? String(c.chainId) : (c.chain || c.name);
				let iconUrl: string | undefined;
				if (c.icon) {
					// Prefer the icons from ethereum-lists (raw github path)
					iconUrl = `https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/icons/${c.icon}/logo.png`;
				}
				const name: string = c.name || c.title || String(id);
				if (!iconUrl) {
					const normalized = name.toLowerCase();
					// Heuristic matching so testnets resolve icons
					if (normalized.includes('ethereum')) iconUrl = ICON_OVERRIDES['ethereum'];
					else if (normalized.includes('binance') || normalized.includes('bnb')) iconUrl = ICON_OVERRIDES['bnb chain'];
					else if (normalized.includes('polygon') || normalized.includes('matic')) iconUrl = ICON_OVERRIDES['polygon'];
					else if (normalized.includes('arbitrum')) iconUrl = ICON_OVERRIDES['arbitrum'];
					else if (normalized.includes('optimism')) iconUrl = ICON_OVERRIDES['optimism'];
					else if (normalized.includes('base')) iconUrl = ICON_OVERRIDES['base'];
					else if (normalized.includes('avalanche')) iconUrl = ICON_OVERRIDES['avalanche'];
					else if (normalized.includes('fantom')) iconUrl = ICON_OVERRIDES['fantom'];
					else if (normalized.includes('gnosis') || normalized.includes('xdai')) iconUrl = ICON_OVERRIDES['gnosis'];
					else if (normalized.includes('cronos')) iconUrl = ICON_OVERRIDES['cronos'];
					else if (normalized.includes('zilliqa')) iconUrl = ICON_OVERRIDES['zilliqa'];
					else if (normalized.includes('waves')) iconUrl = ICON_OVERRIDES['waves'];
					else if (normalized.includes('vechain')) iconUrl = ICON_OVERRIDES['vechain'];
					else if (normalized.includes('tron')) iconUrl = ICON_OVERRIDES['tron'];
					else if (ICON_OVERRIDES[normalized]) iconUrl = ICON_OVERRIDES[normalized];
				}
				return { id, name, iconUrl } as NetworkChain;
			});
			// Deduplicate by name
			const seen = new Set<string>();
			const unique = out.filter((c) => {
				if (seen.has(c.name)) return false;
				seen.add(c.name);
				return true;
			});
			return unique;
		} catch (_e) {
			return [];
		}
	}

	static async fetchChainsCached(): Promise<NetworkChain[]> {
		try {
			const cached = await AsyncStorage.getItem(CHAINS_CACHE_KEY);
			if (cached) {
				const parsed = JSON.parse(cached);
				if (parsed && parsed.timestamp && Array.isArray(parsed.data)) {
					const fresh = Date.now() - parsed.timestamp < CHAINS_CACHE_TTL_MS;
					if (fresh) return parsed.data as NetworkChain[];
				}
			}
		} catch {}

		const data = await this.fetchChains();
		try {
			await AsyncStorage.setItem(CHAINS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
		} catch {}
		return data;
	}
}


