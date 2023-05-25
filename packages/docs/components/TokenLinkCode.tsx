import { useRef, useEffect } from 'react'

interface Children {
  children: JSX.Element[]
}

interface TokenLinkCodeProps extends Children {
  tokens: (string | Record<string, string>)[] | Record<string, string>
}

export default function TokenLinkCode({
  children,
  tokens,
}: TokenLinkCodeProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  if (!Array.isArray(tokens)) {
    // eslint-disable-next-line no-param-reassign
    tokens = [tokens]
  }
  // Let's Change something inside the post
  useEffect(() => {
    let tokenLinkMap: Record<string, string> = {}
    for (const tokenOrObj of tokens as (string | Record<string, string>)[]) {
      if (typeof tokenOrObj === 'string') {
        tokenLinkMap[tokenOrObj] = `#${tokenOrObj.toLowerCase()}`
      } else {
        tokenLinkMap = { ...tokenLinkMap, ...tokenOrObj }
      }
    }

    const container = containerRef?.current
    const allTokenElements = container?.querySelectorAll('code > .line > span')

    for (const element of allTokenElements || []) {
      const textContent = element?.textContent?.trim()
      const link = tokenLinkMap[textContent as string]
      if (link) {
        const prefix = element?.textContent?.startsWith('.') ? '.' : ''
        element.innerHTML = `${prefix}<a href="${link}" style=" color: inherit; cursor: pointer;">${element.textContent?.slice(
          prefix.length,
        )}</a>`
      }
    }
  }, [children, tokens, containerRef])

  return <span ref={containerRef}>{children}</span>
}
