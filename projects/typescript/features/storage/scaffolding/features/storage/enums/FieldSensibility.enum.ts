/**
 * Public: ANYONE can read this field, even non authorized readers
 * Personal: ONLY the owner can read this field
 * Private: Only the system can read this field
 * Sensible: Only the system can read this field and this field is encrypted or stored in a secure way
**/

export enum FieldSensibility {
    Public = 'public',
    Personal = 'personal',
    Private = 'private',
    Sensible = 'sensible'
}