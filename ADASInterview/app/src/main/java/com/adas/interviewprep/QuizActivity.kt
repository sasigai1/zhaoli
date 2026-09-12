package com.adas.interviewprep

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class QuizActivity : Activity() {

    private var queue: List<Question> = emptyList()
    private var index = 0
    private var answerVisible = false
    private var knownCount = 0
    private var unknownCount = 0
    private var started = false

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        title = "刷题模式"
        setContentView(R.layout.activity_quiz)
        buildStartScreen()
    }

    private fun buildStartScreen() {
        started = false
        findViewById<LinearLayout>(R.id.quiz_start).visibility = View.VISIBLE
        findViewById<LinearLayout>(R.id.quiz_card).visibility = View.GONE
        findViewById<LinearLayout>(R.id.quiz_result).visibility = View.GONE

        val chipContainer = findViewById<LinearLayout>(R.id.quiz_chip_container)
        chipContainer.removeAllViews()

        data class Mode(val label: String, val pick: () -> List<Question>)
        val modes = listOf(
            Mode("🔀 全部（乱序）") { DataStore.questions.shuffled() },
            Mode("🔧 待巩固") { DataStore.wrongQuestions(this).shuffled() },
            Mode("⭐ 收藏夹") { DataStore.favorites(this).shuffled() }
        ) + DataStore.categories.map { c -> Mode(c) { DataStore.questions.filter { it.category == c }.shuffled() } }

        modes.forEach { mode ->
            val chip = TextView(this).apply {
                text = mode.label
                textSize = 15f
                setTextColor(getColor(R.color.accent))
                background = getDrawable(R.drawable.bg_card)
                setPadding(dp(16), dp(14), dp(16), dp(14))
                setOnClickListener {
                    val picked = mode.pick()
                    if (picked.isEmpty()) {
                        android.widget.Toast.makeText(this@QuizActivity, "该分类暂无题目，先去刷几道题吧", android.widget.Toast.LENGTH_SHORT).show()
                    } else {
                        startQuiz(picked)
                    }
                }
            }
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            lp.bottomMargin = dp(8)
            chipContainer.addView(chip, lp)
        }
    }

    private fun startQuiz(questions: List<Question>) {
        queue = questions
        index = 0
        knownCount = 0
        unknownCount = 0
        started = true
        DataStore.incrementQuizRounds(this)
        findViewById<LinearLayout>(R.id.quiz_start).visibility = View.GONE
        findViewById<LinearLayout>(R.id.quiz_card).visibility = View.VISIBLE
        findViewById<LinearLayout>(R.id.quiz_result).visibility = View.GONE
        showCard()
    }

    private fun showCard() {
        val q = queue[index]
        answerVisible = false
        findViewById<TextView>(R.id.quiz_progress).text = "第 ${index + 1} / ${queue.size} 题"
        findViewById<TextView>(R.id.quiz_category).text = "${q.category} · 难度${"★".repeat(q.difficulty)}"
        findViewById<TextView>(R.id.quiz_question).text = q.question
        val answerView = findViewById<TextView>(R.id.quiz_answer)
        answerView.text = q.answer
        answerView.visibility = View.GONE
        findViewById<Button>(R.id.btn_show_answer).visibility = View.VISIBLE
        findViewById<LinearLayout>(R.id.quiz_judge_buttons).visibility = View.GONE
    }

    override fun onResume() {
        super.onResume()
        if (started) showCard()
    }

    fun onShowAnswer(@Suppress("unused") view: View) {
        answerVisible = true
        findViewById<TextView>(R.id.quiz_answer).visibility = View.VISIBLE
        findViewById<Button>(R.id.btn_show_answer).visibility = View.GONE
        findViewById<LinearLayout>(R.id.quiz_judge_buttons).visibility = View.VISIBLE
    }

    fun onJudgeKnown(@Suppress("unused") view: View) {
        DataStore.markMastered(this, queue[index].id)
        knownCount++
        next()
    }

    fun onJudgeUnknown(@Suppress("unused") view: View) {
        DataStore.markWrong(this, queue[index].id)
        unknownCount++
        next()
    }

    private fun next() {
        index++
        if (index >= queue.size) showResult() else showCard()
    }

    private fun showResult() {
        findViewById<LinearLayout>(R.id.quiz_start).visibility = View.GONE
        findViewById<LinearLayout>(R.id.quiz_card).visibility = View.GONE
        findViewById<LinearLayout>(R.id.quiz_result).visibility = View.VISIBLE
        val total = queue.size
        val pct = knownCount * 100 / total.coerceAtLeast(1)
        findViewById<TextView>(R.id.quiz_result_text).text =
            "本轮完成 🎉\n\n共 $total 题\n✅ 掌握 $knownCount 题（$pct%）\n🔧 待巩固 $unknownCount 题\n\n待巩固的题已自动加入「待巩固」清单，\n可到刷题模式或题库中重点复习。"
        findViewById<Button>(R.id.btn_quiz_again).setOnClickListener { buildStartScreen() }
    }
}
