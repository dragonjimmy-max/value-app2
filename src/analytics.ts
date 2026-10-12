export function validMeasurementId(value:unknown):value is string{
 return typeof value==='string'&&/^G-[A-Z0-9]{6,15}$/.test(value);
}
