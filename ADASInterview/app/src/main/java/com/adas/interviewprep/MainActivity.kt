package com.adas.interviewprep

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        setContentView(R.layout.activity_main)
        buildDashboard()
    }

    override fun onResume() {
        super.onResume()
        buildDashboard()
    }

    private fun buildDashboard() {
        val container = findViewById<LinearLayout>(R.id.dashboard_container)
        container.removeAllViews()

        // header
        container.addView(headerView("ADAS 面试通", "时鸿飞专属 · 车载测试面试冲刺"))

        // stats card
        val total = DataStore.questions.size
        val mastered = DataStore.masteredCount(this)
        val wrong = DataStore.wrongCount(this)
        val fav = DataStore.favoriteCount(this)
        val statsText = "题库 $total 题 · 已掌握 $mastered · 待巩固 $wrong · 收藏 $fav"
        container.addView(statsCard(statsText, (mastered * 100 / total.coerceAtLeast(1))))

        // menu entries
        container.addView(sectionLabel("学习模块"))
        addMenuItem(container, "📚 知识库", "26个核心知识点：ADAS功能 / 测试流程 / 工具技能", "#FF4FC3F7") {
            startActivity(Intent(this, KnowledgeListActivity::class.java))
        }
        addMenuItem(container, "📖 面试题库", "${DataStore.questions.size}道高频面试题，6大分类含参考答案", "#FF66BB6A") {
            startActivity(Intent(this, QuestionListActivity::class.java))
        }
        addMenuItem(container, "🃏 刷题模式", "卡片式刷题：看题→想答案→对照→自评掌握", "#FFFFB74D") {
            startActivity(Intent(this, QuizActivity::class.java))
        }
        addMenuItem(container, "🎤 模拟面试", "随机抽题全真模拟，计时+自评+结果分析", "#FFBA68C8") {
            startActivity(Intent(this, MockInterviewActivity::class.java))
        }

        container.addView(sectionLabel("我的面试"))
        addMenuItem(container, "🎯 简历攻略", "基于你的简历定制：自我介绍 / 深挖问题 / 临场话术", "#FFE57373") {
            startActivity(Intent(this, GuideActivity::class.java))
        }
        addMenuItem(container, "📊 学习统计", "进度总览 / 收藏夹 / 待巩固清单", "#FF4DB6AC") {
            startActivity(Intent(this, StatsActivity::class.java))
        }
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    private fun headerView(title: String, subtitle: String): View {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(4), dp(16), dp(4), dp(16))
        }
        layout.addView(TextView(this).apply {
            text = title
            textSize = 30f
            setTextColor(getColor(R.color.text_primary))
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        })
        layout.addView(TextView(this).apply {
            text = subtitle
            textSize = 13f
            setTextColor(getColor(R.color.text_secondary))
            setPadding(0, dp(6), 0, 0)
        })
        return layout
    }

    private fun statsCard(text: String, progress: Int): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = getDrawable(R.drawable.bg_card)
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }
        card.addView(TextView(this).apply {
            this.text = text
            textSize = 14f
            setTextColor(getColor(R.color.text_primary))
        })
        // progress bar
        val barBg = LinearLayout(this).apply {
            setBackgroundColor(getColor(R.color.divider))
        }
        val barFill = View(this).apply { setBackgroundColor(getColor(R.color.accent_green)) }
        barBg.addView(barFill, LinearLayout.LayoutParams(0, dp(6)))
        barBg.post {
            val lp = barFill.layoutParams
            lp.width = barBg.width * progress / 100
            barFill.layoutParams = lp
        }
        card.addView(barBg, LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
        (barBg.layoutParams as LinearLayout.LayoutParams).topMargin = dp(12)
        card.addView(TextView(this).apply {
            this.text = "掌握进度 $progress%"
            textSize = 12f
            setTextColor(getColor(R.color.accent_green))
            setPadding(0, dp(8), 0, 0)
        })
        val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
        lp.bottomMargin = dp(8)
        card.layoutParams = lp
        return card
    }

    private fun sectionLabel(text: String): View = TextView(this).apply {
        this.text = text
        textSize = 13f
        setTextColor(getColor(R.color.text_secondary))
        setPadding(dp(4), dp(16), dp(4), dp(10))
    }

    private fun addMenuItem(container: LinearLayout, title: String, subtitle: String, colorHex: String, onClick: () -> Unit) {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = getDrawable(R.drawable.bg_card)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            isClickable = true
            setOnClickListener { onClick() }
        }
        card.addView(TextView(this).apply {
            text = title
            textSize = 17f
            setTextColor(Color.parseColor(colorHex))
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        })
        card.addView(TextView(this).apply {
            text = subtitle
            textSize = 13f
            setTextColor(getColor(R.color.text_secondary))
            setPadding(0, dp(4), 0, 0)
        })
        val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
        lp.bottomMargin = dp(10)
        container.addView(card, lp)
    }
}
