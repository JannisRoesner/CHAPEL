/** Eindeutiger (synthetischer) Hash einer Tempo-Variante – teilt die Datei des Originals. */
export function variantFileHash(parentHash: string, rate: number): string {
  return `${parentHash}@${rate.toFixed(2)}`
}
