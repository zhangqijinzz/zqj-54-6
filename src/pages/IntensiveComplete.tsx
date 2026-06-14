import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Target, Clock, Zap, ArrowRight, RotateCcw, CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { questions } from '@/data/questions'
import { CATEGORY_CONFIG } from '@/data/types'

type ChangeDirection = 'up' | 'down' | 'same' | null

interface MetricChange {
  current: number
  previous: number | null
  direction: ChangeDirection
  formatted: string
}

export default function IntensiveComplete() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { intensiveSessions, getWeakPointsList } = useStore()

  const sessionId = searchParams.get('sessionId')

  const { currentSession, previousSession } = useMemo(() => {
    const current = intensiveSessions.find((s) => s.id === sessionId) || null
    const others = intensiveSessions.filter((s) => s.id !== sessionId)
    const previous = others.length > 0 ? others[0] : null
    return { currentSession: current, previousSession: previous }
  }, [intensiveSessions, sessionId])

  const weakPoints = getWeakPointsList()

  const metrics = useMemo<{
    passed: MetricChange
    failed: MetricChange
    avgTime: MetricChange
    avgStuck: MetricChange
  } | null>(() => {
    if (!currentSession) return null

    const calcChange = (current: number, previous: number | null): MetricChange => {
      let direction: ChangeDirection = null
      if (previous !== null) {
        if (current > previous) direction = 'up'
        else if (current < previous) direction = 'down'
        else direction = 'same'
      }
      return {
        current,
        previous,
        direction,
        formatted: previous !== null ? `${current - previous >= 0 ? '+' : ''}${current - previous}` : '',
      }
    }

    return {
      passed: calcChange(currentSession.passedCount, previousSession?.passedCount ?? null),
      failed: calcChange(currentSession.failedCount, previousSession?.failedCount ?? null),
      avgTime: calcChange(currentSession.avgTime, previousSession?.avgTime ?? null),
      avgStuck: calcChange(currentSession.avgStuckCount, previousSession?.avgStuckCount ?? null),
    }
  }, [currentSession, previousSession])

  const isAllMastered = currentSession ? currentSession.failedCount === 0 : false

  const handleRetry = () => {
    navigate('/review')
  }

  const handleBackToReview = () => {
    navigate('/review')
  }

  const getChangeIcon = (direction: ChangeDirection, isBetterWhenDown: boolean = false) => {
    if (direction === null) return null
    const isBetter = isBetterWhenDown ? direction === 'down' : direction === 'up'
    const color = isBetter ? 'text-[#00e676]' : direction === 'same' ? 'text-white/40' : 'text-[#ff1744]'
    
    if (direction === 'up') return <TrendingUp className={`w-4 h-4 ${color}`} />
    if (direction === 'down') return <TrendingDown className={`w-4 h-4 ${color}`} />
    return <Minus className={`w-4 h-4 ${color}`} />
  }

  const getChangeText = (metric: MetricChange, isBetterWhenDown: boolean = false) => {
    if (metric.direction === null) return null
    const isBetter = isBetterWhenDown ? metric.direction === 'down' : metric.direction === 'up'
    const color = isBetter ? 'text-[#00e676]' : metric.direction === 'same' ? 'text-white/40' : 'text-[#ff1744]'
    return <span className={`text-xs font-medium ${color}`}>{metric.formatted}</span>
  }

  if (!currentSession || !metrics) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <p className="text-white/40">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#ff6b35]/20 to-[#ff3d00]/20 flex items-center justify-center mb-4"
            >
              <Trophy className="w-10 h-10 text-[#ff6b35]" />
            </motion.div>
            <h2 className="text-white text-2xl font-bold">强化练习完成</h2>
            <p className="text-white/40 text-sm">
              {previousSession ? '与上次强化练习对比' : '首次完成强化练习'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#00e676]/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                </div>
                <span className="text-white/40 text-xs">通过</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-white text-3xl font-bold">{metrics.passed.current}</p>
                {metrics.passed.direction !== null && (
                  <div className="flex items-center gap-1 mb-1">
                    {getChangeIcon(metrics.passed.direction)}
                    {getChangeText(metrics.passed)}
                  </div>
                )}
              </div>
              <p className="text-white/20 text-xs mt-1">共 {currentSession.results.length} 题</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#ff1744]/15 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-[#ff1744]" />
                </div>
                <span className="text-white/40 text-xs">未通过</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-white text-3xl font-bold">{metrics.failed.current}</p>
                {metrics.failed.direction !== null && (
                  <div className="flex items-center gap-1 mb-1">
                    {getChangeIcon(metrics.failed.direction, true)}
                    {getChangeText(metrics.failed, true)}
                  </div>
                )}
              </div>
              <p className="text-white/20 text-xs mt-1">需继续强化</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/15 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#6366f1]" />
                </div>
                <span className="text-white/40 text-xs">平均用时</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-white text-3xl font-bold">{metrics.avgTime.current}<span className="text-lg font-normal text-white/40">s</span></p>
                {metrics.avgTime.direction !== null && (
                  <div className="flex items-center gap-1 mb-1">
                    {getChangeIcon(metrics.avgTime.direction, true)}
                    {getChangeText(metrics.avgTime, true)}
                  </div>
                )}
              </div>
              <p className="text-white/20 text-xs mt-1">单题平均</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#ff6b35]" />
                </div>
                <span className="text-white/40 text-xs">平均卡壳</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-white text-3xl font-bold">{metrics.avgStuck.current}<span className="text-lg font-normal text-white/40">次</span></p>
                {metrics.avgStuck.direction !== null && (
                  <div className="flex items-center gap-1 mb-1">
                    {getChangeIcon(metrics.avgStuck.direction, true)}
                    {getChangeText(metrics.avgStuck, true)}
                  </div>
                )}
              </div>
              <p className="text-white/20 text-xs mt-1">单题平均</p>
            </motion.div>
          </div>

          {currentSession.results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-5"
            >
              <p className="text-white/60 text-sm font-medium mb-4">答题详情</p>
              <div className="space-y-3">
                {currentSession.results.map((result) => {
                  const q = questions.find((q) => q.id === result.questionId)
                  if (!q) return null
                  return (
                    <div
                      key={result.questionId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        result.isPassed ? 'bg-[#00e676]/15' : 'bg-[#ff1744]/15'
                      }`}>
                        {result.isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ff1744]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{q.text}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${CATEGORY_CONFIG[q.category].color}15`, color: CATEGORY_CONFIG[q.category].color }}>
                            {CATEGORY_CONFIG[q.category].label}
                          </span>
                          <span className="text-white/30 text-xs">{result.actualTime}s</span>
                          {result.stuckCount > 0 && (
                            <span className="text-[#ff1744] text-xs">卡壳×{result.stuckCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`rounded-2xl p-6 text-center ${
              isAllMastered
                ? 'bg-gradient-to-br from-[#00e676]/15 to-[#00e676]/5 border border-[#00e676]/20'
                : 'bg-gradient-to-br from-[#ff6b35]/15 to-[#ff3d00]/5 border border-[#ff6b35]/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className={`w-5 h-5 ${isAllMastered ? 'text-[#00e676]' : 'text-[#ff6b35]'}`} />
              <p className={`text-lg font-bold ${isAllMastered ? 'text-[#00e676]' : 'text-[#ff6b35]'}`}>
                {isAllMastered ? '本轮全部掌握' : `仍有${currentSession.failedCount}题需继续强化`}
              </p>
            </div>
            {!isAllMastered && weakPoints.length > 0 && (
              <p className="text-white/40 text-sm">
                当前共有 {weakPoints.length} 个卡壳问题待强化
              </p>
            )}
            {isAllMastered && (
              <p className="text-white/40 text-sm">
                太棒了！继续保持，挑战更多问题吧
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff3d00] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/20"
            >
              <RotateCcw className="w-4 h-4" />
              再来一轮
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackToReview}
              className="flex-1 py-3.5 rounded-xl bg-white/5 text-white/60 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              返回复盘台
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
