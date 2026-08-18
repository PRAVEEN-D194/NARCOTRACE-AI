from graph_engine import IntelligenceGraph

def populate_mock_data(igraph: IntelligenceGraph) -> None:
    """
    Populates the intelligence graph with a highly realistic, multilingual,
    multi-platform drug trafficking ring scenario.
    """
    igraph.clear()

    # --- 1. ADD NODES ---
    
    # Actors (Importers & Smugglers)
    igraph.add_node(
        node_id="actor_afghan_supplier",
        node_type="actor",
        label="Hassan_Quetta",
        risk_score=98.0,
        metadata={
            "role": "International Importer",
            "location": "Quetta Border",
            "substances": ["Heroin"],
            "platform": "Threema",
            "analyst_confidence": 0.95
        }
    )
    
    igraph.add_node(
        node_id="actor_punjab_wholesale",
        node_type="actor",
        label="Amritsar_Bulk",
        risk_score=95.0,
        metadata={
            "role": "Interstate Distributor",
            "location": "Amritsar, Punjab",
            "substances": ["Heroin", "Opium"],
            "platform": "Signal",
            "analyst_confidence": 0.92
        }
    )

    # Cross-Platform Resolved Actor (DarkWolf23 / Wolf_23 / DW23)
    igraph.add_node(
        node_id="actor_darkwolf23",
        node_type="actor",
        label="DarkWolf23 (Core Target)",
        risk_score=91.0,
        metadata={
            "role": "Dark Web Vendor / TG Handler",
            "location": "Bengaluru, Karnataka",
            "substances": ["Heroin", "MDMA", "Meth"],
            "platform": "Raptor Market / Telegram",
            "aliases": ["Wolf_23", "DW23"],
            "analyst_confidence": 0.91
        }
    )

    # Local Coordinators (South & North India)
    igraph.add_node(
        node_id="actor_karthik_tamil",
        node_type="actor",
        label="Karthik_M (South Coord)",
        risk_score=78.0,
        metadata={
            "role": "Regional Distributor",
            "location": "Chennai, Tamil Nadu",
            "substances": ["Heroin", "MDMA"],
            "platform": "WhatsApp / Telegram",
            "analyst_confidence": 0.88
        }
    )

    igraph.add_node(
        node_id="actor_sanjay_delhi",
        node_type="actor",
        label="Sanjay_Delhi (North Coord)",
        risk_score=72.0,
        metadata={
            "role": "Regional Distributor",
            "location": "Delhi NCR",
            "substances": ["Heroin", "Chitta"],
            "platform": "Signal",
            "analyst_confidence": 0.82
        }
    )

    # Street/Campus Peddlers (Retail Level)
    igraph.add_node(
        node_id="actor_peddler_vellore",
        node_type="actor",
        label="Peddler_VIT",
        risk_score=48.0,
        metadata={
            "role": "Campus Peddler",
            "location": "Vellore, Tamil Nadu",
            "substances": ["Heroin", "MDMA"],
            "platform": "Telegram",
            "analyst_confidence": 0.85
        }
    )

    igraph.add_node(
        node_id="actor_peddler_chennai",
        node_type="actor",
        label="Peddler_SRM",
        risk_score=45.0,
        metadata={
            "role": "Campus Peddler",
            "location": "Chennai, Tamil Nadu",
            "substances": ["MDMA", "Weed"],
            "platform": "WhatsApp",
            "analyst_confidence": 0.80
        }
    )

    # Accounts
    igraph.add_node("acct_raptor_darkwolf", "account", "RaptorMarket: DarkWolf23", 90.0, {"platform": "Raptor Market (Dark Web)"})
    igraph.add_node("acct_tg_wolf23", "account", "Telegram: @Wolf_23", 85.0, {"platform": "Telegram"})
    igraph.add_node("acct_forum_dw23", "account", "DreadForum: DW23", 70.0, {"platform": "Dread (Dark Web)"})
    igraph.add_node("acct_wa_karthik", "account", "WhatsApp: +91-9840XXXXXX", 78.0, {"platform": "WhatsApp"})

    # Wallets
    igraph.add_node("wallet_afghan_monero", "wallet", "XMR_Afghan_Wallet (Quetta)", 98.0, {"crypto_type": "Monero (XMR)"})
    igraph.add_node("wallet_punjab_btc", "wallet", "BTC_Punjab_Wallet (Amritsar)", 95.0, {"crypto_type": "Bitcoin (BTC)"})
    igraph.add_node("wallet_wolf_dark", "wallet", "BTC_Wolf_DarkWeb", 90.0, {"crypto_type": "Bitcoin (BTC)"})
    igraph.add_node("wallet_wolf_tg", "wallet", "BTC_Wolf_Telegram", 85.0, {"crypto_type": "Bitcoin (BTC)"})
    igraph.add_node("wallet_karthik_btc", "wallet", "BTC_Karthik_Chennai", 78.0, {"crypto_type": "Bitcoin (BTC)"})
    igraph.add_node("wallet_peddler_vellore", "wallet", "UPI_Vellore_Proxy", 45.0, {"crypto_type": "UPI / PayTM Proxy"})

    # Listings
    igraph.add_node(
        node_id="listing_raptor_chitta",
        node_type="listing",
        label="Listing: Afghan White Sugar #1",
        risk_score=85.0,
        metadata={
            "platform": "Raptor Market",
            "title": "Afghan White Sugar (Pure Heroin) - India-wide Shipping",
            "price": "0.08 BTC/10g",
            "substance": "Heroin"
        }
    )
    igraph.add_node(
        node_id="listing_raptor_mdma",
        node_type="listing",
        label="Listing: Pink Tesla MDMA 250mg",
        risk_score=80.0,
        metadata={
            "platform": "Raptor Market",
            "title": "Pink Tesla MDMA - imported from Netherlands",
            "price": "0.05 BTC/5 pills",
            "substance": "MDMA"
        }
    )

    # Substances
    igraph.add_node("substance_heroin", "substance", "Heroin (Chitta)", 100.0, {"aliases": ["chitta", "maal", "stuff", "white sugar"]})
    igraph.add_node("substance_mdma", "substance", "MDMA (Molly)", 80.0, {"aliases": ["pink tesla", "m-cat", "molly", "tesla"]})

    # --- 2. ADD RELATIONSHIPS (EDGES) WITH TIMESTAMPS ---
    # Setup chronological order for timeline evolution:
    # May 2026 -> June 2026 -> July 2026 -> August 2026

    # Phase 1: Importer to Smuggler Flow (May 2026)
    igraph.add_edge(
        source="actor_afghan_supplier",
        target="actor_punjab_wholesale",
        edge_type="supplies_to",
        weight=9.5,
        timestamp="2026-05-10T08:30:00Z",
        metadata={"substance": "Heroin", "route": "Border-Cross Border Couriers"}
    )
    igraph.add_edge(
        source="wallet_punjab_btc",
        target="wallet_afghan_monero",
        edge_type="transacted_with",
        weight=8.5,
        timestamp="2026-05-12T14:15:00Z",
        metadata={"amount": "2.85 BTC", "equivalent_usd": 171000, "confidence": 0.95}
    )
    igraph.add_edge(
        source="actor_afghan_supplier",
        target="wallet_afghan_monero",
        edge_type="controls_wallet",
        weight=1.0,
        timestamp="2026-05-01T12:00:00Z"
    )
    igraph.add_edge(
        source="actor_punjab_wholesale",
        target="wallet_punjab_btc",
        edge_type="controls_wallet",
        weight=1.0,
        timestamp="2026-05-01T12:00:00Z"
    )

    # Phase 2: Dark Web Integration & Listing Creation (June 2026)
    igraph.add_edge(
        source="actor_punjab_wholesale",
        target="actor_darkwolf23",
        edge_type="supplies_to",
        weight=8.8,
        timestamp="2026-06-05T10:00:00Z",
        metadata={"substance": "Heroin", "route": "Interstate Truck Transport"}
    )
    igraph.add_edge(
        source="wallet_wolf_dark",
        target="wallet_punjab_btc",
        edge_type="transacted_with",
        weight=8.0,
        timestamp="2026-06-07T18:22:00Z",
        metadata={"amount": "1.25 BTC", "equivalent_usd": 75000, "confidence": 0.90}
    )
    igraph.add_edge(
        source="actor_darkwolf23",
        target="wallet_wolf_dark",
        edge_type="controls_wallet",
        weight=1.0,
        timestamp="2026-06-01T09:00:00Z"
    )
    igraph.add_edge(
        source="actor_darkwolf23",
        target="acct_raptor_darkwolf",
        edge_type="operates",
        weight=1.0,
        timestamp="2026-06-01T09:00:00Z"
    )
    igraph.add_edge(
        source="acct_raptor_darkwolf",
        target="listing_raptor_chitta",
        edge_type="posted",
        weight=1.0,
        timestamp="2026-06-02T11:00:00Z"
    )
    igraph.add_edge(
        source="acct_raptor_darkwolf",
        target="listing_raptor_mdma",
        edge_type="posted",
        weight=1.0,
        timestamp="2026-06-03T15:30:00Z"
    )
    igraph.add_edge(
        source="listing_raptor_chitta",
        target="substance_heroin",
        edge_type="mentions",
        weight=1.0,
        timestamp="2026-06-02T11:00:00Z"
    )
    igraph.add_edge(
        source="listing_raptor_mdma",
        target="substance_mdma",
        edge_type="mentions",
        weight=1.0,
        timestamp="2026-06-03T15:30:00Z"
    )

    # Phase 3: Entity Resolution & Multi-platform Expansion (July 2026)
    # Member 2 entity resolution results: DarkWolf23 <=> Wolf_23 <=> DW23
    igraph.add_edge(
        source="actor_darkwolf23",
        target="acct_tg_wolf23",
        edge_type="operates",
        weight=1.0,
        timestamp="2026-07-01T09:00:00Z"
    )
    igraph.add_edge(
        source="actor_darkwolf23",
        target="acct_forum_dw23",
        edge_type="operates",
        weight=1.0,
        timestamp="2026-07-02T10:00:00Z"
    )
    igraph.add_edge(
        source="actor_darkwolf23",
        target="wallet_wolf_tg",
        edge_type="controls_wallet",
        weight=1.0,
        timestamp="2026-07-05T09:00:00Z"
    )

    # Intra-target crypto movements showing connection
    igraph.add_edge(
        source="wallet_wolf_tg",
        target="wallet_wolf_dark",
        edge_type="transacted_with",
        weight=7.5,
        timestamp="2026-07-08T11:45:00Z",
        metadata={"amount": "0.45 BTC", "equivalent_usd": 27000, "confidence": 0.99, "reason": "Internal asset consolidation"}
    )

    # South-India Regional link (Karthik M) setup
    igraph.add_edge(
        source="actor_darkwolf23",
        target="actor_karthik_tamil",
        edge_type="supplies_to",
        weight=7.8,
        timestamp="2026-07-10T14:00:00Z",
        metadata={"substance": "Heroin", "courier": "Speed Post parcel"}
    )
    igraph.add_edge(
        source="wallet_karthik_btc",
        target="wallet_wolf_tg",
        edge_type="transacted_with",
        weight=7.2,
        timestamp="2026-07-12T16:10:00Z",
        metadata={"amount": "0.18 BTC", "equivalent_usd": 10800, "confidence": 0.88}
    )
    igraph.add_edge(
        source="actor_karthik_tamil",
        target="wallet_karthik_btc",
        edge_type="controls_wallet",
        weight=1.0,
        timestamp="2026-07-05T12:00:00Z"
    )
    igraph.add_edge(
        source="actor_karthik_tamil",
        target="acct_wa_karthik",
        edge_type="operates",
        weight=1.0,
        timestamp="2026-07-05T12:00:00Z"
    )

    # North-India Regional link (Sanjay Delhi) setup
    igraph.add_edge(
        source="actor_darkwolf23",
        target="actor_sanjay_delhi",
        edge_type="supplies_to",
        weight=7.0,
        timestamp="2026-07-15T13:00:00Z",
        metadata={"substance": "Chitta/Heroin"}
    )

    # Phase 4: Retail street / campus peddling (August 2026)
    igraph.add_edge(
        source="actor_karthik_tamil",
        target="actor_peddler_vellore",
        edge_type="supplies_to",
        weight=6.8,
        timestamp="2026-08-01T11:00:00Z",
        metadata={"substance": "Heroin/MDMA", "frequency": "Weekly"}
    )
    igraph.add_edge(
        source="actor_karthik_tamil",
        target="actor_peddler_chennai",
        edge_type="supplies_to",
        weight=6.5,
        timestamp="2026-08-03T12:30:00Z",
        metadata={"substance": "MDMA", "frequency": "Bi-weekly"}
    )

    # Street level transactions (UPI/Cash equivalents)
    igraph.add_edge(
        source="wallet_peddler_vellore",
        target="wallet_karthik_btc",
        edge_type="transacted_with",
        weight=5.0,
        timestamp="2026-08-05T17:40:00Z",
        metadata={"amount": "₹1,20,000", "channel": "Crypto Broker/UPI proxy"}
    )
    igraph.add_edge(
        source="actor_peddler_vellore",
        target="wallet_peddler_vellore",
        edge_type="controls_wallet",
        weight=1.0,
        timestamp="2026-08-01T10:00:00Z"
    )

    # Multilingual drug mentions (Member 1 Ingestion simulation)
    # Hinglish & Tamil slang mentions of drug terminology mapping to substances
    igraph.add_edge(
        source="acct_tg_wolf23",
        target="substance_heroin",
        edge_type="mentions",
        weight=0.9,
        timestamp="2026-08-10T10:15:00Z",
        metadata={
            "language": "Hinglish",
            "original_text": "Bhai chitta quality is pure fire, stock up soon",
            "normalized_text": "Brother heroin quality is pure fire, stock up soon",
            "translation": "Brother heroin quality is pure fire, stock up soon",
            "confidence": 0.95
        }
    )

    igraph.add_edge(
        source="acct_wa_karthik",
        target="substance_heroin",
        edge_type="mentions",
        weight=0.85,
        timestamp="2026-08-11T14:20:00Z",
        metadata={
            "language": "Tanglish/Tamil",
            "original_text": "Innu 2 days la chitta stock vandhurum, kavalapadadha",
            "normalized_text": "In other 2 days heroin stock will arrive, do not worry",
            "translation": "Heroin stock will arrive in 2 days, do not worry",
            "confidence": 0.88
        }
    )

    igraph.add_edge(
        source="acct_wa_karthik",
        target="substance_mdma",
        edge_type="mentions",
        weight=0.8,
        timestamp="2026-08-12T09:45:00Z",
        metadata={
            "language": "Tanglish",
            "original_text": "Tesla pills (MDMA) stock fulla pathu vainga, college buyers waiting",
            "normalized_text": "Tesla pills (MDMA) stock fully secure it, college buyers waiting",
            "translation": "Secure all the MDMA Tesla pills stock, college buyers are waiting",
            "confidence": 0.92
        }
    )
