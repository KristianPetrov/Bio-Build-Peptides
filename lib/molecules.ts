export type MoleculeEntry = { file: string; name: string };

/** Parses `file.ext|Display name` entries stored on products. */
export function parseMolecules(values: string[]): MoleculeEntry[] {
  return values
    .map((value) => {
      const [file, name] = value.split("|");
      return file ? { file, name: name || file } : null;
    })
    .filter((entry): entry is MoleculeEntry => entry !== null);
}
