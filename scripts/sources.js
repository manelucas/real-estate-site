// Official public data sources used to build the database.
// Every record in the database can be traced back to one of these files.

const DOR = 'https://floridarevenue.com/property/dataportal/Documents/PTO%20Data%20Portal/Tax%20Roll%20Data%20Files';

export const SOURCES = [
  {
    id: 'dor_nal',
    name: 'Florida Dept. of Revenue — 2026 Final Name-Address-Legal (NAL) tax roll, Palm Beach County (60)',
    publisher: 'Florida Department of Revenue, Property Tax Oversight',
    url: `${DOR}/NAL/2026F/Palm%20Beach%2060%20Final%20NAL%202026.zip`,
    landing: 'https://floridarevenue.com/property/Pages/DataPortal_RequestAssessmentRollGISData.aspx',
    file: 'nal.zip',
    unzipTo: 'nal',
  },
  {
    id: 'dor_sdf',
    name: 'Florida Dept. of Revenue — 2026 Final Sale Data File (SDF), Palm Beach County (60)',
    publisher: 'Florida Department of Revenue, Property Tax Oversight',
    url: `${DOR}/SDF/2026F/Palm%20Beach%2060%20Final%20SDF%202026.zip`,
    landing: 'https://floridarevenue.com/property/Pages/DataPortal_RequestAssessmentRollGISData.aspx',
    file: 'sdf.zip',
    unzipTo: 'sdf',
  },
  {
    id: 'pbctax_county_certs',
    name: 'Palm Beach County Tax Collector — County-held tax certificates (unpaid delinquent real-estate taxes)',
    publisher: 'Constitutional Tax Collector, Serving Palm Beach County',
    url: 'https://www.pbctax.gov/wp-content/uploads/2026/11/County_Certs_PBCTax-11.2.26.xlsx',
    landing: 'https://www.pbctax.gov/taxes/property-tax/tax-certificates-and-deeds/',
    // The file name carries its publication date and changes with each update.
    discover: /https?:\/\/[^"'\s]*County_Certs[^"'\s]*\.xlsx/i,
    file: 'county_certs.xlsx',
  },
];

// Official per-parcel pages used for manual and automated verification.
// Parcel IDs are 17 characters; most are digits but ~1,900 contain letters (e.g. 12434609A10010000).
export const pid17 = (p) => String(p).replace(/[^0-9A-Za-z]/g, '').toUpperCase();
export const pidDashed = (p) => {
  const d = pid17(p);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 6), d.slice(6, 8), d.slice(8, 10), d.slice(10, 13), d.slice(13)].join('-');
};
export const links = (p) => ({
  propertyAppraiser: `https://pbcpao.gov/Property/Details?parcelId=${pid17(p)}`,
  taxCollector: `https://pbctax.publicaccessnow.com/PropertyTax.aspx?s=ParcelID:${pidDashed(p)}&pg=1&g=-1&moduleId=449`,
  realTda: `https://www.realtda.com/index.cfm?zmethod=asearch&zaction=asearch_act&countyInUse=203418&txtParcelId=${pid17(p)}`,
});
