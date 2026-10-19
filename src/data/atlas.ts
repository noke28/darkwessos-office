export type AtlasPlace={location_id:string;name:string;note:string;source_id:string|null;kind:'TEST'|'SOURCE';lat:number;lng:number};
// TEST: koordinate su shematske, ne kanonska geografija.
export const atlasPlaces:AtlasPlace[]=[{location_id:'test-darkwood',name:'Darkwood — TEST marker',note:'Shematska demonstracija. Koordinate nisu kanon.',source_id:'test-darkwood-source',kind:'TEST',lat:0,lng:0}];
