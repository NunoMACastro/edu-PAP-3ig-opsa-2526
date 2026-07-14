/**
 * @file Catálogo operacional mínimo partilhado pelo bootstrap e pelas seeds OPSA.
 *
 * O catálogo contém apenas as contas e a taxa de IVA necessárias aos postings
 * de venda/compra da demonstração. As classificações SAF-T são explícitas para
 * que o bootstrap não tenha de inferir hierarquias fiscais.
 */

export const COMPANY_BOOTSTRAP_ACCOUNTS = Object.freeze([
    Object.freeze({ code: "2", name: "Contas a receber e a pagar", parentCode: null, level: 1, saftGroupingCategory: "GR", saftGroupingCode: null, saftTaxonomyCode: null }),
    Object.freeze({ code: "21", name: "Clientes", parentCode: "2", level: 2, saftGroupingCategory: "GA", saftGroupingCode: "2", saftTaxonomyCode: null }),
    Object.freeze({ code: "211", name: "Clientes c/c", parentCode: "21", level: 3, saftGroupingCategory: "GM", saftGroupingCode: "21", saftTaxonomyCode: 211 }),
    Object.freeze({ code: "22", name: "Fornecedores", parentCode: "2", level: 2, saftGroupingCategory: "GA", saftGroupingCode: "2", saftTaxonomyCode: null }),
    Object.freeze({ code: "221", name: "Fornecedores c/c", parentCode: "22", level: 3, saftGroupingCategory: "GM", saftGroupingCode: "22", saftTaxonomyCode: 221 }),
    Object.freeze({ code: "24", name: "Estado e outros entes públicos", parentCode: "2", level: 2, saftGroupingCategory: "GA", saftGroupingCode: "2", saftTaxonomyCode: null }),
    Object.freeze({ code: "2432", name: "IVA dedutível", parentCode: "24", level: 4, saftGroupingCategory: "GM", saftGroupingCode: "24", saftTaxonomyCode: 243 }),
    Object.freeze({ code: "2433", name: "IVA liquidado", parentCode: "24", level: 4, saftGroupingCategory: "GM", saftGroupingCode: "24", saftTaxonomyCode: 243 }),
    Object.freeze({ code: "6", name: "Gastos", parentCode: null, level: 1, saftGroupingCategory: "GR", saftGroupingCode: null, saftTaxonomyCode: null }),
    Object.freeze({ code: "62", name: "Fornecimentos e serviços externos", parentCode: "6", level: 2, saftGroupingCategory: "GM", saftGroupingCode: "6", saftTaxonomyCode: 62 }),
    Object.freeze({ code: "7", name: "Rendimentos", parentCode: null, level: 1, saftGroupingCategory: "GR", saftGroupingCode: null, saftTaxonomyCode: null }),
    Object.freeze({ code: "71", name: "Vendas", parentCode: "7", level: 2, saftGroupingCategory: "GM", saftGroupingCode: "7", saftTaxonomyCode: 71 }),
    Object.freeze({ code: "72", name: "Prestações de serviços", parentCode: "7", level: 2, saftGroupingCategory: "GM", saftGroupingCode: "7", saftTaxonomyCode: 72 }),
]);

export const COMPANY_BOOTSTRAP_VAT_RATE = Object.freeze({
    code: "IVA23",
    description: "IVA normal 23%",
    rateBps: 2300,
    type: "NORMAL",
    exemptionReason: null,
    exemptionCode: null,
    taxCountryRegion: "PT",
    isActive: true,
});

export const COMPANY_BOOTSTRAP_DEMO_PRODUCT = Object.freeze({
    sku: "PAP-DEMO-001",
    name: "Produto demonstrativo PAP",
    type: "PRODUCT",
    costCents: 1_000,
    priceCents: 2_500,
    vatRateBps: 2300,
    unitOfMeasure: "UN",
    isActive: true,
    openingQuantity: 20,
});
