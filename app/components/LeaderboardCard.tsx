'use client'

import React from 'react'

interface LeaderboardEntry {
  ranking: number
  demon: string
  avatar: string
  score: number
  address?: string
  tokenId?: string
  username?: string
}

interface LeaderboardCardProps {
  title: string
  icon: string
  subtitle: string
  scoreLabel: string
  entries: LeaderboardEntry[]
  titleType?: 'dungeons' | 'enemies'
  userAddress?: string
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  icon,
  scoreLabel,
  entries,
  titleType,
  userAddress
}) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isCurrentUser = (entryAddress?: string) => {
    if (!userAddress || !entryAddress) return false
    return userAddress.toLowerCase() === entryAddress.toLowerCase()
  }

  return (
    <div className="relative bg-[#00000080] border border-[#242424] rounded-xl w-full max-w-[580px] md:max-w-[500px] mt-12 md:mt-8">
      <img 
        src={icon} 
        alt={title} 
        className="absolute -top-8 md:-top-6 sm:-top-6 left-1/2 -translate-x-1/2 w-16 h-16 md:w-12 md:h-12 sm:w-10 sm:h-10 brightness-[1.3] contrast-[1.2] z-10" 
      />
      <div className="p-8 md:p-6 sm:p-5 pb-6 md:pb-4 sm:pb-3 border-b-2 border-[#242424] bg-black/20 text-center">
        <div className="text-center">
          <h2 className="text-[#EAE3D3] text-base md:text-[13px] sm:text-[11px] font-medium m-0 tracking-[4px] md:tracking-[2px] sm:tracking-[1px] uppercase" style={{ fontFamily: 'var(--font-harmonique)' }}>
            LEADERBOARD
          </h2>
          <h3 className="text-[#EAE3D3] text-[1.4rem] md:text-base sm:text-sm font-medium m-[0.3rem_0_0_0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" style={{ fontFamily: 'var(--font-harmonique)' }}>
            {titleType === 'dungeons' ? (
              <>
                <span className="text-[#FFB38A]">Dungeons</span> Completed
              </>
            ) : titleType === 'enemies' ? (
              <>
                Enemies' <span className="text-[#FF8C8A]">Kills</span>
              </>
            ) : (
              title
            )}
          </h3>
        </div>
      </div>

      <div className="p-0">
        <div className="grid grid-cols-[100px_1fr_180px] md:grid-cols-[50px_1fr_80px] sm:grid-cols-[45px_1fr_75px] py-5 px-8 md:py-3 md:px-3 sm:py-2.5 sm:px-2.5 border-b-2 border-[#242424] bg-black/30">
          <span className="text-[#BFBFBF] text-[15px] md:text-[11px] sm:text-[8px] font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-center md:whitespace-normal sm:whitespace-normal md:break-words sm:break-words md:leading-tight sm:leading-tight" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Ranking
          </span>
          <span className="text-[#BFBFBF] text-[15px] md:text-[11px] sm:text-[8px] font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase md:whitespace-normal sm:whitespace-normal md:break-words sm:break-words md:leading-tight sm:leading-tight" style={{ fontFamily: 'var(--font-harmonique)' }}>
            Demon
          </span>
          <span className="text-[#BFBFBF] text-[15px] md:text-[10px] sm:text-[7.5px] font-light tracking-[1.5px] md:tracking-[0.5px] sm:tracking-[0.2px] uppercase text-right md:whitespace-normal sm:whitespace-normal md:break-words sm:break-words md:leading-tight sm:leading-tight" style={{ fontFamily: 'var(--font-harmonique)' }}>
            {scoreLabel}
          </span>
        </div>

        <div className="max-h-[350px] overflow-y-auto overflow-x-hidden">
          {entries.map((entry) => {
            const isUser = isCurrentUser(entry.address)
            return (
              <div
                key={entry.ranking}
                className={`grid grid-cols-[100px_1fr_180px] md:grid-cols-[50px_1fr_80px] sm:grid-cols-[45px_1fr_75px] py-5 px-8 md:py-3 md:px-3 sm:py-2.5 sm:px-2.5 border-b border-[#242424] items-center transition-all duration-200 bg-black/20 ${
                  isUser 
                    ? 'bg-[rgba(131,233,150,0.15)] border border-[#83E996] border-l-[3px] border-l-[#83E996] shadow-[0_0_15px_rgba(131,233,150,0.3)] hover:bg-[rgba(131,233,150,0.2)] hover:translate-x-[3px]' 
                    : 'hover:bg-[rgba(131,233,150,0.1)] hover:translate-x-[2px]'
                } last:border-b-0 last:rounded-b-xl`}
              >
                <span className={`text-center text-2xl md:text-base sm:text-sm font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                  isUser ? 'text-[#83E996] drop-shadow-[0_0_8px_rgba(131,233,150,0.5)]' : 'text-[#FFF1E6]'
                }`} style={{ fontFamily: 'var(--font-harmonique)' }}>
                  {entry.ranking}
                </span>
                <div className="flex items-center gap-4 md:gap-2.5 sm:gap-1.5">
                  <img 
                    src={entry.avatar} 
                    alt={entry.demon} 
                    className="w-10 h-10 md:w-8 md:h-8 sm:w-6.5 sm:h-6.5 rounded-full border-2 border-[#242424] bg-[#2a2a2a] shadow-[0_2px_8px_rgba(0,0,0,0.4)]" 
                  />
                  <span className={`text-lg md:text-sm sm:text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] md:overflow-hidden md:text-ellipsis md:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap ${
                    isUser ? 'text-[#83E996] drop-shadow-[0_0_8px_rgba(131,233,150,0.5)] font-bold' : 'text-[#FFF1E6]'
                  }`} style={{ fontFamily: 'var(--font-zachar)' }}>
                    {entry.username || (entry.address ? shortenAddress(entry.address) : entry.demon)}
                  </span>
                </div>
                <span className={`text-right text-xl md:text-sm sm:text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                  isUser ? 'text-[#83E996] drop-shadow-[0_0_8px_rgba(131,233,150,0.5)]' : 'text-[#FFF1E6]'
                }`} style={{ fontFamily: 'var(--font-harmonique)' }}>
                  {entry.score.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardCard