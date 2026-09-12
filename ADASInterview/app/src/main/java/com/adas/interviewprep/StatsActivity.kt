package com.adas.interviewprep

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView

class StatsActivity : Activity() {

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        title = "学习统计"
        setContentView(R.layout.activity_stats)
    }

    override fun onResume() {
        super.onResume()
        buildStats()
    }

    private fun buildStats() {
        val container = findViewById<LinearLayout>(R.id.stats_container)
        container.removeAllViews()

        val total = DataStore.questions.size
        val mastered = DataStore.masteredCount(this)
        val wrong = DataStore.wrongCount(this)
        val fav = DataStore.favoriteCount(this)
        val quizRounds = DataStore.quizRounds(this)
        val mockCount = DataStore.mockCount(this)

        addStatCard(container, "总览",
            "题库总数：$total 题\n已掌握：$mastered 题（${mastered * 100 / total.coerceAtLeast(1)}%）\n待巩固：$wrong 题\n收藏：$fav 题\n刷题轮次：$quizRounds 次\n模拟面试：$mockCount 次")

        // per-category progress
        val sb = StringBuilder()
        DataStore.categories.forEach { c ->
            val catQuestions = DataStore.questions.filter { it.category == c }
            val m = catQuestions.count { DataStore.isMastered(this, it.id) }
            sb.append("$c：$m / ${catQuestions.size} 已掌握\n")
        }
        addStatCard(container, "分类进度", sb.toString().trim())

        // quick entries
        addActionCard(container, "⭐ 查看收藏夹（$fav 题）") {
            startActivity(Intent(this, QuestionListActivity::class.java).putExtra("onlyFavorites", true))
        }
        addActionCard(container, "🔧 查看待巩固（$wrong 题）") {
            startActivity(Intent(this, QuestionListActivity::class.java).putExtra("onlyWrong", true))
        }
    }

    private fun addStatCard(container: LinearLayout, title: String, body: String) {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = getDrawable(R.drawable.bg_card)
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }
        card.addView(TextView(this).apply {
            text = title
            textSize = 17f
            setTextColor(getColor(R.color.accent))
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        })
        card.addView(TextView(this).apply {
            text = body
            textSize = 14f
            setTextColor(getColor(R.color.text_primary))
            setLineSpacing(0f, 1.4f)
            setPadding(0, dp(8), 0, 0)
        })
        val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
        lp.bottomMargin = dp(12)
        container.addView(card, lp)
    }

    private fun addActionCard(container: LinearLayout, title: String, onClick: () -> Unit) {
        val card = TextView(this).apply {
            text = title
            textSize = 16f
            setTextColor(getColor(R.color.text_primary))
            background = getDrawable(R.drawable.bg_card)
            setPadding(dp(16), dp(16), dp(16), dp(16))
            setOnClickListener { onClick() }
        }
        val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
        lp.bottomMargin = dp(12)
        container.addView(card, lp)
    }
}
