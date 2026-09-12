package com.adas.interviewprep

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView

class QuestionDetailActivity : Activity() {

    private var questionId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        setContentView(R.layout.activity_question_detail)

        questionId = intent.getIntExtra("id", -1)
        val q = DataStore.questions.firstOrNull { it.id == questionId } ?: run { finish(); return }

        title = q.category
        findViewById<TextView>(R.id.detail_title).text = q.question
        findViewById<TextView>(R.id.detail_meta).text =
            "${q.category} · 难度${"★".repeat(q.difficulty)}"
        findViewById<TextView>(R.id.detail_content).text = q.answer

        val btnFavorite = findViewById<Button>(R.id.btn_favorite)
        val btnMastered = findViewById<Button>(R.id.btn_mastered)
        val btnWrong = findViewById<Button>(R.id.btn_wrong)

        fun refreshButtons() {
            btnFavorite.text = if (DataStore.isFavorite(this, q.id)) "⭐ 已收藏" else "☆ 收藏"
            btnMastered.text = if (DataStore.isMastered(this, q.id)) "✅ 已掌握" else "标记掌握"
            btnWrong.text = if (DataStore.isWrong(this, q.id)) "🔧 待巩固中" else "待巩固"
        }
        refreshButtons()

        btnFavorite.setOnClickListener { DataStore.toggleFavorite(this, q.id); refreshButtons() }
        btnMastered.setOnClickListener {
            if (DataStore.isMastered(this, q.id)) DataStore.unmark(this, q.id)
            else DataStore.markMastered(this, q.id)
            refreshButtons()
        }
        btnWrong.setOnClickListener {
            if (DataStore.isWrong(this, q.id)) DataStore.unmark(this, q.id)
            else DataStore.markWrong(this, q.id)
            refreshButtons()
        }
    }
}
