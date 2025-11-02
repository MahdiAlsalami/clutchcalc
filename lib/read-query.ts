export function readQuery(searchParams: Record<string, string | string[] | undefined>) {
  const extractValue = (value: string | string[] | undefined): string | null => {
    if (Array.isArray(value)) return value[0] || null
    return value || null
  }

  return {
    player: extractValue(searchParams.player),
    opponent: extractValue(searchParams.opponent),
    stat: extractValue(searchParams.stat),
    line: extractValue(searchParams.line),
    window: extractValue(searchParams.window),
  }
}
