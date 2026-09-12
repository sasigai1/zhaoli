package com.adas.interviewprep

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class KnowledgeDetailActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        setContentView(R.layout.activity_detail)

        val id = intent.getIntExtra("id", -1)
        val item = DataStore.knowledge.firstOrNull { it.id == id } ?: run { finish(); return }

        title = item.title
        findViewById<TextView>(R.id.detail_title).text = item.title
        findViewById<TextView>(R.id.detail_meta).text = item.category
        findViewById<TextView>(R.id.detail_content).text = item.content
    }
}
