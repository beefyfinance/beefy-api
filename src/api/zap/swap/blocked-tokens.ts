import { ApiChain } from '../../../utils/chain';
import { addressBook } from '../../../../packages/address-book/src/address-book';

/**
 * Tokens addresses that are blocked from being swapped on a given chain.
 * We can skip checking liquidity for these tokens, which will use fewer api requests.
 * Addresses should be check-summed.
 * We use a block list over an allow list so new tokens can be supported without a code change.
 * Tokens are sourced from vaults and boosts.
 */
export const blockedTokensByChain: Record<ApiChain, Set<string>> = {
  bsc: new Set([
    '0x13F6751ba11337BC67aBBdAd638a56194ee133B8', // SDUMP
    '0x1446f3CEdf4d86a9399E49f7937766E6De2A3AAB', // KRW
    '0x1f546aD641B56b86fD9dCEAc473d1C7a357276B7', // PANTHER
    '0x339550404Ca4d831D12B1b2e4768869997390010', // DRUGS
    '0x34EA3F7162E6f6Ed16bD171267eC180fD5c848da', // DND
    '0x4ECfb95896660aa7F54003e967E7b283441a2b0A', // FRUIT
    '0x52d86850bc8207b520340B7E39cDaF22561b9E56', // SWIRL
    '0x53F39324Fbb209693332B87aA94D5519A1a49aB0', // sBGO
    '0x57efFdE2759b68d86C544e88F7977e3314144859', // DIS
    '0x639d4C62F58a4048AD0F69B8CE675dB1A3e8e00e', // EXP
    '0x69F27E70E820197A6e495219D9aC34C8C6dA7EeE', // SOUPS
    '0x6F695Bd5FFD25149176629f8491A5099426Ce7a7', // sALPACA
    '0x787732f27D18495494cea3792ed7946BbCFF8db2', // MASH
    '0x7Cc46141AB1057b1928de5Ad5Ee78Bb37eFC4868', // TNDR
    '0x86aFa7ff694Ab8C985b79733745662760e454169', // VENUS BLP'
    '0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556', // NUTS
    '0x9768E5b2d8e761905BC81Dfc554f9437A46CdCC6', // PALM
    '0xA1928c0D8F83C0bFB7ebE51B412b1FD29A277893', // SAT
    '0xA25Dab5B75aC0E0738E58E49734295baD43d73F1', // BITI
    '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f', // BURGER
    '0xD0dff49De3E314FDFD3f93c5EEee7D5d2F5515cD', // ZBTC
    '0xDA360309C59CB8C434b28A91b823344a96444278', // MERL
    '0xE1F2d89a6c79b4242F300f880e490A70083E9A1c', // TOFY
    '0xE8c93310af068aa50bd7bF0ebFa459Df2a02ceba', // MOON
    '0xFa363022816aBf82f18a9C2809dCd2BB393F6AC5', // HONEY
    '0xcc2E12a9b5b75360c6FBf23B584c275D52cDdb0E', // CROW
    '0xdbEb98858f5d4Dca13EA0272B2b786E9415d3992', // ZETH
    '0xeE814F5B2bF700D2e843Dc56835D28d095161dd9', // GRAND
    addressBook.bsc.tokens.AAVE.address,
    addressBook.bsc.tokens.ADX.address,
    addressBook.bsc.tokens.ALICE.address,
    addressBook.bsc.tokens.ALPA.address,
    addressBook.bsc.tokens.ALPACA.address,
    addressBook.bsc.tokens.ALPHA.address,
    addressBook.bsc.tokens.ANN.address,
    addressBook.bsc.tokens.AOT.address,
    addressBook.bsc.tokens.APE.address,
    addressBook.bsc.tokens.APYS.address,
    addressBook.bsc.tokens.ARPA.address,
    addressBook.bsc.tokens.ATA.address,
    addressBook.bsc.tokens.ATOM.address,
    addressBook.bsc.tokens.AURO.address,
    addressBook.bsc.tokens.AXS.address,
    addressBook.bsc.tokens.BABY.address,
    addressBook.bsc.tokens.BAKE.address,
    addressBook.bsc.tokens.BANANA.address,
    addressBook.bsc.tokens.BAND.address,
    addressBook.bsc.tokens.BAPE.address,
    addressBook.bsc.tokens.BELT.address,
    addressBook.bsc.tokens.BETA.address,
    addressBook.bsc.tokens.BETU.address,
    addressBook.bsc.tokens.BHC.address,
    addressBook.bsc.tokens.BISON.address,
    addressBook.bsc.tokens.BLZ.address,
    addressBook.bsc.tokens.BMON.address,
    addressBook.bsc.tokens.BOMB.address,
    addressBook.bsc.tokens.BP.address,
    addressBook.bsc.tokens.BREW.address,
    addressBook.bsc.tokens.BRY.address,
    addressBook.bsc.tokens.BRZw.address,
    addressBook.bsc.tokens.BSCDEFI.address,
    addressBook.bsc.tokens.BSCPAD.address,
    addressBook.bsc.tokens.BSCX.address,
    addressBook.bsc.tokens.BSHARE.address,
    addressBook.bsc.tokens.BTCST.address,
    addressBook.bsc.tokens.BTR.address,
    addressBook.bsc.tokens.BTS.address,
    addressBook.bsc.tokens.BTT.address,
    addressBook.bsc.tokens.BUNNY.address,
    addressBook.bsc.tokens.BUSM.address,
    addressBook.bsc.tokens.C98.address,
    addressBook.bsc.tokens.CAPS.address,
    addressBook.bsc.tokens.CARROT.address,
    addressBook.bsc.tokens.CCAR.address,
    addressBook.bsc.tokens.CEEK.address,
    addressBook.bsc.tokens.CELR.address,
    addressBook.bsc.tokens.CHESS.address,
    addressBook.bsc.tokens.CHR.address,
    addressBook.bsc.tokens.COMP.address,
    addressBook.bsc.tokens.CONE.address,
    addressBook.bsc.tokens.COS.address,
    addressBook.bsc.tokens.COTI.address,
    addressBook.bsc.tokens.CRUSH.address,
    addressBook.bsc.tokens.CTK.address,
    addressBook.bsc.tokens.CYC.address,
    addressBook.bsc.tokens.CYT.address,
    addressBook.bsc.tokens.CZF.address,
    addressBook.bsc.tokens.DAR.address,
    addressBook.bsc.tokens.DEP.address,
    addressBook.bsc.tokens.DERI.address,
    addressBook.bsc.tokens.DEXE.address,
    addressBook.bsc.tokens.DFD.address,
    addressBook.bsc.tokens.DFT.address,
    addressBook.bsc.tokens.DIBS.address,
    addressBook.bsc.tokens.DKT.address,
    addressBook.bsc.tokens.DODO.address,
    addressBook.bsc.tokens.DPT.address,
    addressBook.bsc.tokens.DSHARE.address,
    addressBook.bsc.tokens.DUET.address,
    addressBook.bsc.tokens.DUSK.address,
    addressBook.bsc.tokens.EGLD.address,
    addressBook.bsc.tokens.ELK.address,
    addressBook.bsc.tokens.EMP.address,
    addressBook.bsc.tokens.EPS.address,
    addressBook.bsc.tokens.ERA.address,
    addressBook.bsc.tokens.ERTHA.address,
    addressBook.bsc.tokens.ESHARE.address,
    addressBook.bsc.tokens.ETC.address,
    addressBook.bsc.tokens.ETERNAL.address,
    addressBook.bsc.tokens.FET.address,
    addressBook.bsc.tokens.FINE.address,
    addressBook.bsc.tokens.FRONT.address,
    addressBook.bsc.tokens.FROYO.address,
    addressBook.bsc.tokens.FUEL.address,
    addressBook.bsc.tokens.FUSE.address,
    addressBook.bsc.tokens.FXS.address,
    addressBook.bsc.tokens.GAL.address,
    addressBook.bsc.tokens.GM.address,
    addressBook.bsc.tokens.GMT.address,
    addressBook.bsc.tokens.GOAL.address,
    addressBook.bsc.tokens.GOLD.address,
    addressBook.bsc.tokens.GOLDCOIN.address,
    addressBook.bsc.tokens.GUARD.address,
    addressBook.bsc.tokens.GUM.address,
    addressBook.bsc.tokens.HAI.address,
    addressBook.bsc.tokens.HEC.address,
    addressBook.bsc.tokens.HERO.address,
    addressBook.bsc.tokens.HIGH.address,
    addressBook.bsc.tokens.HOOP.address,
    addressBook.bsc.tokens.HOTCROSS.address,
    addressBook.bsc.tokens.HPS.address,
    addressBook.bsc.tokens.HZN.address,
    addressBook.bsc.tokens.ICA.address,
    addressBook.bsc.tokens.INJ.address,
    addressBook.bsc.tokens.INSUR.address,
    addressBook.bsc.tokens.IOTA.address,
    addressBook.bsc.tokens.IOTX.address,
    addressBook.bsc.tokens.IRON.address,
    addressBook.bsc.tokens.ITAM.address,
    addressBook.bsc.tokens.JGN.address,
    addressBook.bsc.tokens.JulD.address,
    addressBook.bsc.tokens.KART.address,
    addressBook.bsc.tokens.KEBAB.address,
    addressBook.bsc.tokens.KEYFI.address,
    addressBook.bsc.tokens.KTN.address,
    addressBook.bsc.tokens.LAC.address,
    addressBook.bsc.tokens.LAND.address,
    addressBook.bsc.tokens.LAZIO.address,
    addressBook.bsc.tokens.LINA.address,
    addressBook.bsc.tokens.LIT.address,
    addressBook.bsc.tokens.LMT.address,
    addressBook.bsc.tokens.LONG.address,
    addressBook.bsc.tokens.MASK.address,
    addressBook.bsc.tokens.MBOX.address,
    addressBook.bsc.tokens.MCB.address,
    addressBook.bsc.tokens.MDX.address,
    addressBook.bsc.tokens.MILK.address,
    addressBook.bsc.tokens.MIR.address,
    addressBook.bsc.tokens.MSC.address,
    addressBook.bsc.tokens.MSS.address,
    addressBook.bsc.tokens.NABOX.address,
    addressBook.bsc.tokens.NAOS.address,
    addressBook.bsc.tokens.NAUT.address,
    addressBook.bsc.tokens.NEAR.address,
    addressBook.bsc.tokens.NFT.address,
    addressBook.bsc.tokens.NUGGET.address,
    addressBook.bsc.tokens.O3.address,
    addressBook.bsc.tokens.OASIS.address,
    addressBook.bsc.tokens.ODDZ.address,
    addressBook.bsc.tokens.OIN.address,
    addressBook.bsc.tokens.OLE.address,
    addressBook.bsc.tokens.ONE.address,
    addressBook.bsc.tokens.ONG.address,
    addressBook.bsc.tokens.ONT.address,
    addressBook.bsc.tokens.OOE.address,
    addressBook.bsc.tokens.ORBS.address,
    addressBook.bsc.tokens.PACOCA.address,
    addressBook.bsc.tokens.PAE.address,
    addressBook.bsc.tokens.PEAR.address,
    addressBook.bsc.tokens.PEEL.address,
    addressBook.bsc.tokens.PERA.address,
    addressBook.bsc.tokens.PMON.address,
    addressBook.bsc.tokens.PMP.address,
    addressBook.bsc.tokens.PORTO.address,
    addressBook.bsc.tokens.POTS.address,
    addressBook.bsc.tokens.PSTAKE.address,
    addressBook.bsc.tokens.QI.address,
    addressBook.bsc.tokens.QKC.address,
    addressBook.bsc.tokens.RACA.address,
    addressBook.bsc.tokens.RAMEN.address,
    addressBook.bsc.tokens.RAMP.address,
    addressBook.bsc.tokens.REEF.address,
    addressBook.bsc.tokens.REVV.address,
    addressBook.bsc.tokens.RPG.address,
    addressBook.bsc.tokens.SALT.address,
    addressBook.bsc.tokens.SAND.address,
    addressBook.bsc.tokens.SANTOS.address,
    addressBook.bsc.tokens.SHIB.address,
    addressBook.bsc.tokens.SING.address,
    addressBook.bsc.tokens.SISTA.address,
    addressBook.bsc.tokens.SKILL.address,
    addressBook.bsc.tokens.SNX.address,
    addressBook.bsc.tokens.SOAK.address,
    addressBook.bsc.tokens.SOUP.address,
    addressBook.bsc.tokens.SPACE.address,
    addressBook.bsc.tokens.SPS.address,
    addressBook.bsc.tokens.STARS.address,
    addressBook.bsc.tokens.STATIC.address,
    addressBook.bsc.tokens.STEEL.address,
    addressBook.bsc.tokens.SUSHI.address,
    addressBook.bsc.tokens.SUTER.address,
    addressBook.bsc.tokens.SWAMP.address,
    addressBook.bsc.tokens.SWTH.address,
    addressBook.bsc.tokens.SXP.address,
    addressBook.bsc.tokens.TAPE.address,
    addressBook.bsc.tokens.TEN.address,
    addressBook.bsc.tokens.TENFI.address,
    addressBook.bsc.tokens.THG.address,
    addressBook.bsc.tokens.TKO.address,
    addressBook.bsc.tokens.TLM.address,
    addressBook.bsc.tokens.TLOS.address,
    addressBook.bsc.tokens.TOR.address,
    addressBook.bsc.tokens.TPT.address,
    addressBook.bsc.tokens.TRIVIA.address,
    addressBook.bsc.tokens.TRX.address,
    addressBook.bsc.tokens.TYPH.address,
    addressBook.bsc.tokens.UBXT.address,
    addressBook.bsc.tokens.USDO.address,
    addressBook.bsc.tokens.UST.address,
    addressBook.bsc.tokens.VAI.address,
    addressBook.bsc.tokens.VALAS.address,
    addressBook.bsc.tokens.VRT.address,
    addressBook.bsc.tokens.WATCH.address,
    addressBook.bsc.tokens.WEX.address,
    addressBook.bsc.tokens.WIN.address,
    addressBook.bsc.tokens.WINGS.address,
    addressBook.bsc.tokens.WOO.address,
    addressBook.bsc.tokens.WOOP.address,
    addressBook.bsc.tokens.WSG.address,
    addressBook.bsc.tokens.WUSD.address,
    addressBook.bsc.tokens.XCV.address,
    addressBook.bsc.tokens.XED.address,
    addressBook.bsc.tokens.XEND.address,
    addressBook.bsc.tokens.XMARK.address,
    addressBook.bsc.tokens.XWG.address,
    addressBook.bsc.tokens.YEL.address,
    addressBook.bsc.tokens.YFI.address,
    addressBook.bsc.tokens.ZEC.address,
    addressBook.bsc.tokens.ZEFI.address,
    addressBook.bsc.tokens.ZIL.address,
    addressBook.bsc.tokens.aBNBc.address,
    addressBook.bsc.tokens.anyMTLX.address,
    addressBook.bsc.tokens.bBADGER.address,
    addressBook.bsc.tokens.bDIGG.address,
    addressBook.bsc.tokens.bROOBEE.address,
    addressBook.bsc.tokens.jCHF.address,
    addressBook.bsc.tokens.mCOIN.address,
    addressBook.bsc.tokens.oldBIFI.address,
    addressBook.bsc.tokens.pBNB.address,
    addressBook.bsc.tokens.pBTC.address,
    addressBook.bsc.tokens.pOPEN.address,
    addressBook.bsc.tokens.rUSD.address,
    addressBook.bsc.tokens.renBTC.address,
    addressBook.bsc.tokens.xBLZD.address,
    addressBook.bsc.tokens['1INCH'].address,
    addressBook.bsc.tokens['AMPL-BSC-mp'].address,
  ]),
  heco: new Set([addressBook.heco.tokens.oldBIFI.address]),
  polygon: new Set([
    '0x0B048D6e01a6b9002C291060bF2179938fd8264c', // ALPHA
    '0x238779aFfE6FFD475cB7e84582FcA7789F310Dc8', // DELIRIUM
    '0x4c19DdeebAF84cA3A255730295AD9d824D4Ff51f', // WISE
    '0x4c4BF319237D98a30A929A96112EfFa8DA3510EB', // WEXPoly
    '0x6bb45cEAC714c52342Ef73ec663479da35934bf7', // BONE
    '0x80c0CBDB8d0B190238795d376f0bD57fd40525F2', // WONE
    '0x883aBe4168705d2e5dA925d28538B7a6AA9d8419', // BALL
    '0x90AC3fa9fCD997B168f218041de26eB01399Bb55', // xYELD
    '0xA863246658DEA34111C3C1DceDb2cfd5d6067334', // WMETIS
    '0xaAa5B9e6c589642f98a1cDA99B9D024B8407285A', // TITAN
    '0xd0f3121A190d85dE0AB6131f2bCEcdbfcfB38891', // YELD
    '0xfE1a200637464FBC9B60Bc7AeCb9b86c0E1d486E', // LITHIUM
    addressBook.polygon.tokens.AVAX.address,
    addressBook.polygon.tokens.AXS.address,
    addressBook.polygon.tokens.AZUKI.address,
    addressBook.polygon.tokens.BANANA.address,
    addressBook.polygon.tokens.BCT.address,
    addressBook.polygon.tokens.BNB.address,
    addressBook.polygon.tokens.BOOK.address,
    addressBook.polygon.tokens.CADC.address,
    addressBook.polygon.tokens.CEL.address,
    addressBook.polygon.tokens.CLAM.address,
    addressBook.polygon.tokens.CRYSTL.address,
    addressBook.polygon.tokens.DEGEN.address,
    addressBook.polygon.tokens.DFYN.address,
    addressBook.polygon.tokens.DINO.address,
    addressBook.polygon.tokens.DOKI.address,
    addressBook.polygon.tokens.DYST.address,
    addressBook.polygon.tokens.ETH2x.address,
    addressBook.polygon.tokens.FISH.address,
    addressBook.polygon.tokens.FODL.address,
    addressBook.polygon.tokens.FTM.address,
    addressBook.polygon.tokens.FUSE.address,
    addressBook.polygon.tokens.GENESIS.address,
    addressBook.polygon.tokens.GHST.address,
    addressBook.polygon.tokens.GIDDY.address,
    addressBook.polygon.tokens.GRT.address,
    addressBook.polygon.tokens.HBAR.address,
    addressBook.polygon.tokens.HONOR.address,
    addressBook.polygon.tokens.ICE.address,
    addressBook.polygon.tokens.IRON.address,
    addressBook.polygon.tokens.IXT.address,
    addressBook.polygon.tokens.JPYC.address,
    addressBook.polygon.tokens.JRT.address,
    addressBook.polygon.tokens.KIRO.address,
    addressBook.polygon.tokens.KLIMA.address,
    addressBook.polygon.tokens.MANA.address,
    addressBook.polygon.tokens.MUST.address,
    addressBook.polygon.tokens.NEAR.address,
    addressBook.polygon.tokens.NEXO.address,
    addressBook.polygon.tokens.NZDS.address,
    addressBook.polygon.tokens.PAE.address,
    addressBook.polygon.tokens.PEAR.address,
    addressBook.polygon.tokens.PSP.address,
    addressBook.polygon.tokens.PUP.address,
    addressBook.polygon.tokens.PZAP.address,
    addressBook.polygon.tokens.QI.address,
    addressBook.polygon.tokens.ROUTE.address,
    addressBook.polygon.tokens.SAND.address,
    addressBook.polygon.tokens.SHIB.address,
    addressBook.polygon.tokens.SOL.address,
    addressBook.polygon.tokens.SOLACE.address,
    addressBook.polygon.tokens.SPADE.address,
    addressBook.polygon.tokens.SX.address,
    addressBook.polygon.tokens.TOMB.address,
    addressBook.polygon.tokens.TUSD.address,
    addressBook.polygon.tokens.UST.address,
    addressBook.polygon.tokens.VISION.address,
    addressBook.polygon.tokens.WATCH.address,
    addressBook.polygon.tokens.WCRO.address,
    addressBook.polygon.tokens.WFIL.address,
    addressBook.polygon.tokens.WMATIC_DFYN.address,
    addressBook.polygon.tokens.WOOFY.address,
    addressBook.polygon.tokens.XSGD.address,
    addressBook.polygon.tokens.cxADA.address,
    addressBook.polygon.tokens.cxBTC.address,
    addressBook.polygon.tokens.cxDOGE.address,
    addressBook.polygon.tokens.cxETH.address,
    addressBook.polygon.tokens.ibBTC.address,
    addressBook.polygon.tokens.ironICE.address,
    addressBook.polygon.tokens.jCAD.address,
    addressBook.polygon.tokens.jCHF.address,
    addressBook.polygon.tokens.jGBP.address,
    addressBook.polygon.tokens.jJPY.address,
    addressBook.polygon.tokens.jNZD.address,
    addressBook.polygon.tokens.jSGD.address,
    addressBook.polygon.tokens.oldBIFI.address,
    addressBook.polygon.tokens.pBREW.address,
    addressBook.polygon.tokens.pMATIC.address,
    addressBook.polygon.tokens.pWINGS.address,
    addressBook.polygon.tokens.rUSD.address,
    addressBook.polygon.tokens.renBTC.address,
    addressBook.polygon.tokens.renDOGE.address,
    addressBook.polygon.tokens.xMARK.address,
    addressBook.polygon.tokens['4EUR'].address,
    addressBook.polygon.tokens['USD+'].address,
  ]),
  fantom: new Set([
    '0x181F3F22C9a751E2ce673498A03E1FDFC0ebBFB6', // EST
    addressBook.fantom.tokens.AAVE.address, // fmcAAVE
    addressBook.fantom.tokens.ANY.address,
    addressBook.fantom.tokens.APE.address,
    addressBook.fantom.tokens.ATLAS.address,
    addressBook.fantom.tokens.BASED.address,
    addressBook.fantom.tokens.BSHARE.address,
    addressBook.fantom.tokens.BUSD.address, // fmcBUSD
    addressBook.fantom.tokens.CHARM.address,
    addressBook.fantom.tokens.COMB.address,
    addressBook.fantom.tokens.COVER.address,
    addressBook.fantom.tokens.CRE8R.address,
    addressBook.fantom.tokens.CRV.address,
    addressBook.fantom.tokens.DEI.address,
    addressBook.fantom.tokens.DEI_OLD.address,
    addressBook.fantom.tokens.DOLA.address,
    addressBook.fantom.tokens.FOO.address,
    addressBook.fantom.tokens.FS.address,
    addressBook.fantom.tokens.FTML.address,
    addressBook.fantom.tokens.HND.address,
    addressBook.fantom.tokens.ICE.address,
    addressBook.fantom.tokens.JEWEL.address,
    addressBook.fantom.tokens.JOE.address,
    addressBook.fantom.tokens.JUST.address,
    addressBook.fantom.tokens.LUNA.address,
    addressBook.fantom.tokens.LUNA.address,
    addressBook.fantom.tokens.MAI.address, // fMAI
    addressBook.fantom.tokens.MATIC.address, // fmcMATIC
    addressBook.fantom.tokens.MIDAS.address,
    addressBook.fantom.tokens.MST.address,
    addressBook.fantom.tokens.MULTI.address,
    addressBook.fantom.tokens.OOE.address,
    addressBook.fantom.tokens.ORKAN.address,
    addressBook.fantom.tokens.OXD.address,
    addressBook.fantom.tokens.PAE.address,
    addressBook.fantom.tokens.PEAR.address,
    addressBook.fantom.tokens.PILLS.address,
    addressBook.fantom.tokens.POTS.address,
    addressBook.fantom.tokens.SCREAM.address,
    addressBook.fantom.tokens.SHADE.address,
    addressBook.fantom.tokens.SNX.address,
    addressBook.fantom.tokens.SOL.address,
    addressBook.fantom.tokens.SOLACE.address,
    addressBook.fantom.tokens.SOLID.address,
    addressBook.fantom.tokens.STEAK.address,
    addressBook.fantom.tokens.SUMMIT.address,
    addressBook.fantom.tokens.SUSHI.address, // fmcSUSHI
    addressBook.fantom.tokens.TAROT.address,
    addressBook.fantom.tokens.TOMB.address,
    addressBook.fantom.tokens.TOR.address,
    addressBook.fantom.tokens.TREEB.address,
    addressBook.fantom.tokens.TSHARE.address,
    addressBook.fantom.tokens.TUSD.address, // fmcTUSD
    addressBook.fantom.tokens.USDB.address,
    addressBook.fantom.tokens.USDL.address,
    addressBook.fantom.tokens.UST.address,
    addressBook.fantom.tokens.UST.address,
    addressBook.fantom.tokens.UST.address,
    addressBook.fantom.tokens.WOO.address,
    addressBook.fantom.tokens.WOOFY.address,
    addressBook.fantom.tokens.WSTA.address,
    addressBook.fantom.tokens.YFI.address, // fmcYFI
    addressBook.fantom.tokens.YOSHI.address,
    addressBook.fantom.tokens.ZOO.address,
    addressBook.fantom.tokens.alUSD.address, // fmcalUSD
    addressBook.fantom.tokens.asUSDC.address,
    addressBook.fantom.tokens.fWINGS.address,
    addressBook.fantom.tokens.gALCX.address, // fmcgALCX
    addressBook.fantom.tokens.gOHM.address,
    addressBook.fantom.tokens.oldBIFI.address,
    addressBook.fantom.tokens.pFTM.address,
    addressBook.fantom.tokens.renBTC.address,
    addressBook.fantom.tokens.sSPELL.address,
    addressBook.fantom.tokens.wMEMO.address,
    addressBook.fantom.tokens.wsHEC.address,
    addressBook.fantom.tokens.wsSPA.address,
    addressBook.fantom.tokens.xBOO.address,
    addressBook.fantom.tokens.xSCREAM.address,
    addressBook.fantom.tokens['2OMB'].address,
    addressBook.fantom.tokens['2SHARES'].address,
    addressBook.fantom.tokens['bb-yv-FTM'].address,
  ]),
  avax: new Set([
    '0x80D18b1c9Ab0c9B5D6A6d5173575417457d00a12', // ATOM
    '0xF9A075C9647e91410bF6C402bDF166e1540f67F0', // SING
    addressBook.avax.tokens.ACRE.address,
    addressBook.avax.tokens.AMPL.address,
    addressBook.avax.tokens.APE.address,
    addressBook.avax.tokens.AVAXL.address,
    addressBook.avax.tokens.BLZZ.address,
    addressBook.avax.tokens.BNB.address,
    addressBook.avax.tokens.BOO.address,
    addressBook.avax.tokens.BPT.address,
    addressBook.avax.tokens.BRIBE.address,
    addressBook.avax.tokens.BUSD.address,
    addressBook.avax.tokens.BUSD.address,
    addressBook.avax.tokens.CLY.address,
    addressBook.avax.tokens.COM.address,
    addressBook.avax.tokens.COOK.address,
    addressBook.avax.tokens.CRA.address,
    addressBook.avax.tokens.CRAFT.address,
    addressBook.avax.tokens.DBY.address,
    addressBook.avax.tokens.DCAU.address,
    addressBook.avax.tokens.DEG.address,
    addressBook.avax.tokens.DOMI.address,
    addressBook.avax.tokens.ECD.address,
    addressBook.avax.tokens.EGG.address,
    addressBook.avax.tokens.FIEF.address,
    addressBook.avax.tokens.FIRE.address,
    addressBook.avax.tokens.FITFI.address,
    addressBook.avax.tokens.FLY.address,
    addressBook.avax.tokens.GRAPE.address,
    addressBook.avax.tokens.HEC.address,
    addressBook.avax.tokens.IME.address,
    addressBook.avax.tokens.JEWEL.address,
    addressBook.avax.tokens.KLO.address,
    addressBook.avax.tokens.LOST.address,
    addressBook.avax.tokens.LUNA.address,
    addressBook.avax.tokens.LYD.address,
    addressBook.avax.tokens.MAI.address,
    addressBook.avax.tokens.MELT.address,
    addressBook.avax.tokens.MONEY.address,
    addressBook.avax.tokens.MORE.address,
    addressBook.avax.tokens.NCASH.address,
    addressBook.avax.tokens.OLIVE.address,
    addressBook.avax.tokens.PAE.address,
    addressBook.avax.tokens.PEFI.address,
    addressBook.avax.tokens.QI.address,
    addressBook.avax.tokens.SPELL.address,
    addressBook.avax.tokens.SUSHI.address,
    addressBook.avax.tokens.SYN.address,
    addressBook.avax.tokens.TIME.address,
    addressBook.avax.tokens.TUS.address,
    addressBook.avax.tokens.UST.address,
    addressBook.avax.tokens.USTw.address,
    addressBook.avax.tokens.VTX.address,
    addressBook.avax.tokens.WINE.address,
    addressBook.avax.tokens.XAVA.address,
    addressBook.avax.tokens.YETI.address,
    addressBook.avax.tokens.aWOOL.address,
    addressBook.avax.tokens.beJOE.address,
    addressBook.avax.tokens.oldBIFI.address,
    addressBook.avax.tokens.pAVAX.address,
    addressBook.avax.tokens.renBTC.address,
    addressBook.avax.tokens['USD+'].address,
  ]),
  one: new Set([addressBook.one.tokens.oldBIFI.address]),
  arbitrum: new Set([
    addressBook.arbitrum.tokens.FISH.address,
    addressBook.arbitrum.tokens.bbaaDAI.address,
    addressBook.arbitrum.tokens.bbaaDAIV2.address,
    addressBook.arbitrum.tokens.bbaaUSDC.address,
    addressBook.arbitrum.tokens.bbaaUSDCV2.address,
    addressBook.arbitrum.tokens.bbaaUSDT.address,
    addressBook.arbitrum.tokens.bbaaUSDTV2.address,
    addressBook.arbitrum.tokens.oldBIFI.address,
  ]),
  celo: new Set([addressBook.celo.tokens.oldBIFI.address]),
  moonriver: new Set([addressBook.moonriver.tokens.oldBIFI.address]),
  cronos: new Set([
    addressBook.cronos.tokens.ALI.address,
    addressBook.cronos.tokens.BNB.address,
    addressBook.cronos.tokens.BUSD.address,
    addressBook.cronos.tokens.CRONA.address,
    addressBook.cronos.tokens.DARK.address,
    addressBook.cronos.tokens.FER.address,
    addressBook.cronos.tokens.FIRA.address,
    addressBook.cronos.tokens.FTM.address,
    addressBook.cronos.tokens.LIQ.address,
    addressBook.cronos.tokens.MATIC.address,
    addressBook.cronos.tokens.SKY.address,
    addressBook.cronos.tokens.oldBIFI.address,
    addressBook.cronos.tokens.pCRO.address,
    addressBook.cronos.tokens.sCRO.address,
  ]),
  aurora: new Set([
    addressBook.aurora.tokens.AURORA.address,
    addressBook.aurora.tokens.AVAX.address,
    addressBook.aurora.tokens.DAI.address,
    addressBook.aurora.tokens.FLX.address,
    addressBook.aurora.tokens.MAI.address,
    addressBook.aurora.tokens.MECHA.address,
    addressBook.aurora.tokens.NEAR.address,
    addressBook.aurora.tokens.SOLACE.address,
    addressBook.aurora.tokens.STNEAR.address,
    addressBook.aurora.tokens.TRI.address,
    addressBook.aurora.tokens.USDC.address,
    addressBook.aurora.tokens.USDT.address,
    addressBook.aurora.tokens.USN.address,
    addressBook.aurora.tokens.WBTC.address,
    addressBook.aurora.tokens.oldBIFI.address,
  ]),
  fuse: new Set([addressBook.fuse.tokens.oldBIFI.address]),
  metis: new Set([addressBook.metis.tokens.oldBIFI.address]),
  moonbeam: new Set([addressBook.moonbeam.tokens.oldBIFI.address]),
  emerald: new Set([addressBook.emerald.tokens.oldBIFI.address]),
  optimism: new Set([
    addressBook.optimism.tokens.L2DAO.address,
    addressBook.optimism.tokens.PERP.address,
    addressBook.optimism.tokens.TUSD.address,
    addressBook.optimism.tokens.bbrfaUSD.address,
    addressBook.optimism.tokens.bbrfaWBTC.address,
    addressBook.optimism.tokens.oldBIFI.address,
    addressBook.optimism.tokens.pETHo.address,
    addressBook.optimism.tokens.sETHo.address,
  ]),
  kava: new Set([addressBook.kava.tokens.oldBIFI.address]),
  ethereum: new Set([
    addressBook.ethereum.tokens.ApeUSD.address,
    addressBook.ethereum.tokens.alETH.address,
    addressBook.ethereum.tokens.bbaDAI.address,
    addressBook.ethereum.tokens.bbaUSD.address,
    addressBook.ethereum.tokens.bbaUSDC.address,
    addressBook.ethereum.tokens.bbaUSDT.address,
    addressBook.ethereum.tokens.multiBTC.address,
    addressBook.ethereum.tokens.oldBIFI.address,
    addressBook.ethereum.tokens.pETH.address,
  ]),
  canto: new Set([addressBook.canto.tokens.oldBIFI.address]),
  zksync: new Set([addressBook.zksync.tokens.oldBIFI.address]),
  zkevm: new Set([]),
  base: new Set([]),
  gnosis: new Set([]),
  linea: new Set([]),
  mantle: new Set([]),
  fraxtal: new Set([]),
  mode: new Set([]),
  manta: new Set([]),
  real: new Set([]),
  sei: new Set([]),
  rootstock: new Set([]),
};
