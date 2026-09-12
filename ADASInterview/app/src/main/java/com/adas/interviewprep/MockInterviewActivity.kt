package com.adas.interviewprep

import android.app.Activity
import android.os.Bundle
import android.os.SystemClock
import android.view.View
import android.widget.Button
import android.widget.Chronometer
import android.widget.LinearLayout
import android.widget.TextView

class MockInterviewActivity : Activity() {

    private var queue: List<Question> = emptyList()
    private var index = 0
    private val scores = mutableListOf<Int>()
    private var startTime = 0L
    private var running = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        title = "模拟面试"
        setContentView(R.layout.activity_mock)

        findViewById<Button>(R.id.btn_mock_start).setOnClickListener { startMock() }
        findViewById<Button>(R.id.btn_mock_restart).setOnClickListener {
            findViewById<LinearLayout>(R.id.mock_intro).visibility = View.VISIBLE
            findViewById<LinearLayout>(R.id.mock_running).visibility = View.GONE
            findViewById<LinearLayout>(R.id.mock_result).visibility = View.GONE
        }
    }

    private fun pick(category: String, n: Int, exclude: Set<Int>): List<Question> =
        DataStore.questions.filter { it.category == category && !exclude.contains(it.id) }.shuffled().take(n)

    private fun startMock() {
        val picked = mutableListOf<Question>()
        val plan = listOf(
            "ADAS功能" to 2, "测试流程" to 1, "工具技能" to 1,
            "总线技术" to 1, "项目经验" to 2, "综合HR" to 1
        )
        plan.forEach { (cat, n) ->
            val ids = picked.map { it.id }.toSet()
            picked.addAll(pick(cat, n, ids))
        }
        if (picked.isEmpty()) return
        queue = picked
        index = 0
        scores.clear()
        running = true
        DataStore.incrementMockCount(this)

        findViewById<LinearLayout>(R.id.mock_intro).visibility = View.GONE
        findViewById<LinearLayout>(R.id.mock_running).visibility = View.VISIBLE
        findViewById<LinearLayout>(R.id.mock_result).visibility = View.GONE

        val timer = findViewById<Chronometer>(R.id.mock_timer)
        timer.base = SystemClock.elapsedRealtime()
        timer.start()
        startTime = SystemClock.elapsedRealtime()
        showQuestion()
    }

    private fun showQuestion() {
        val q = queue[index]
        findViewById<TextView>(R.id.mock_progress).text = "第 ${index + 1} / ${queue.size} 题"
        findViewById<TextView>(R.id.mock_category).text = "${q.category} · 难度${"★".repeat(q.difficulty)}"
        findViewById<TextView>(R.id.mock_question).text = q.question
        val answerView = findViewById<TextView>(R.id.mock_answer)
        answerView.text = "【参考答案】\n${q.answer}"
        answerView.visibility = View.GONE
        findViewById<Button>(R.id.btn_mock_show).visibility = View.VISIBLE
        findViewById<LinearLayout>(R.id.mock_score_buttons).visibility = View.GONE

        findViewById<Button>(R.id.btn_mock_show).setOnClickListener {
            answerView.visibility = View.VISIBLE
            findViewById<Button>(R.id.btn_mock_show).visibility = View.GONE
            findViewById<LinearLayout>(R.id.mock_score_buttons).visibility = View.VISIBLE
        }
        // score buttons 1..5
        val scoreContainer = findViewById<LinearLayout>(R.id.mock_score_row)
        scoreContainer.removeAllViews()
        for (s in 1..5) {
            val b = Button(this).apply {
                text = "$s"
                textSize = 16f
                setOnClickListener { onScore(s) }
            }
            val lp = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            lp.marginEnd = if (s < 5) (6 * resources.displayMetrics.density).toInt() else 0
            scoreContainer.addView(b, lp)
        }
    }

    private fun onScore(s: Int) {
        scores.add(s)
        val q = queue[index]
        if (s >= 4) DataStore.markMastered(this, q.id) else if (s <= 2) DataStore.markWrong(this, q.id)
        index++
        if (index >= queue.size) showResult() else showQuestion()
    }

    private fun showResult() {
        running = false
        val timer = findViewById<Chronometer>(R.id.mock_timer)
        timer.stop()
        val elapsedSec = (SystemClock.elapsedRealtime() - startTime) / 1000
        val mm = elapsedSec / 60
        val ss = elapsedSec % 60

        findViewById<LinearLayout>(R.id.mock_running).visibility = View.GONE
        findViewById<LinearLayout>(R.id.mock_result).visibility = View.VISIBLE

        val avg = if (scores.isEmpty()) 0f else scores.sum().toFloat() / scores.size
        val verdict = when {
            avg >= 4.5f -> "状态极佳，可以去面试了！🚀"
            avg >= 3.5f -> "整体不错，把低分题再过一遍 💪"
            avg >= 2.5f -> "有基础但不稳，重点攻待巩固清单 📖"
            else -> "还需沉淀，先过知识库再刷题 🔧"
        }
        val detail = StringBuilder()
        detail.append("用时 ${mm}分${ss}秒 · 平均自评 ${"%.1f".format(avg)}/5\n\n")
        detail.append("各题表现：\n")
        queue.forEachIndexed { i, q ->
            val s = scores.getOrElse(i) { 0 }
            val mark = if (s >= 4) "✅" else if (s <= 2) "🔧" else "➖"
            detail.append("$mark ${s}分 · ${q.question.take(20)}…\n")
        }
        detail.append("\n$verdict\n低分题已自动加入「待巩固」清单。")
        findViewById<TextView>(R.id.mock_result_text).text = detail.toString()
    }
}
