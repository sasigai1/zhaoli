package com.adas.interviewprep

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.BaseAdapter
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView

class QuestionListActivity : Activity() {

    private var filterCategory: String? = null
    private var onlyFavorites = false
    private var onlyWrong = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        title = "面试题库"
        setContentView(R.layout.activity_question_list)

        onlyFavorites = intent.getBooleanExtra("onlyFavorites", false)
        onlyWrong = intent.getBooleanExtra("onlyWrong", false)

        buildChips()
        refreshList()
    }

    override fun onResume() {
        super.onResume()
        if (::listViewInitialized.isInitialized) refreshList()
    }

    private lateinit var listViewInitialized: Unit

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    private fun buildChips() {
        val chipContainer = findViewById<LinearLayout>(R.id.chip_container)
        chipContainer.removeAllViews()
        val chips = mutableListOf<String?>(null)
        chips.addAll(DataStore.categories)
        chips.forEach { cat ->
            val chip = TextView(this).apply {
                text = cat ?: "全部"
                textSize = 13f
                val selected = filterCategory == cat
                setTextColor(if (selected) getColor(R.color.bg_primary) else getColor(R.color.accent))
                background = getDrawable(R.drawable.bg_chip)?.mutate()
                background?.setTint(if (selected) getColor(R.color.accent) else getColor(R.color.bg_card_pressed))
                setPadding(dp(14), dp(8), dp(14), dp(8))
                setOnClickListener {
                    filterCategory = cat
                    buildChips()
                    refreshList()
                }
            }
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            lp.marginEnd = dp(8)
            chipContainer.addView(chip, lp)
        }
    }

    private fun filteredQuestions(): List<Question> {
        var list = DataStore.questions
        if (onlyFavorites) {
            val favs = DataStore.favorites(this).map { it.id }.toSet()
            list = list.filter { favs.contains(it.id) }
        }
        if (onlyWrong) {
            val wrong = DataStore.wrongQuestions(this).map { it.id }.toSet()
            list = list.filter { wrong.contains(it.id) }
        }
        filterCategory?.let { c -> list = list.filter { it.category == c } }
        return list
    }

    private fun refreshList() {
        val items = filteredQuestions()
        val header = findViewById<TextView>(R.id.list_header)
        val base = when {
            onlyFavorites -> "⭐ 收藏夹"
            onlyWrong -> "🔧 待巩固"
            else -> "📖 面试题库"
        }
        header.text = "$base · ${items.size}题"

        val listView = findViewById<ListView>(R.id.list_view)
        listView.adapter = object : BaseAdapter() {
            override fun getCount() = items.size
            override fun getItem(position: Int) = items[position]
            override fun getItemId(position: Int) = position.toLong()

            override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
                val holder: Pair<TextView, TextView>
                val row: View
                if (convertView == null) {
                    row = layoutInflater.inflate(R.layout.item_two_line, parent, false)
                    holder = row.findViewById<TextView>(R.id.item_title) to row.findViewById<TextView>(R.id.item_subtitle)
                    row.tag = holder
                } else {
                    row = convertView
                    @Suppress("UNCHECKED_CAST")
                    holder = row.tag as Pair<TextView, TextView>
                }
                val q = items[position]
                val fav = if (DataStore.isFavorite(this@QuestionListActivity, q.id)) "⭐ " else ""
                val state = when {
                    DataStore.isMastered(this@QuestionListActivity, q.id) -> " · 已掌握✅"
                    DataStore.isWrong(this@QuestionListActivity, q.id) -> " · 待巩固🔧"
                    else -> ""
                }
                holder.first.text = "$fav${q.question}"
                holder.second.text = "${q.category} · 难度${"★".repeat(q.difficulty)}$state"
                return row
            }
        }
        listView.onItemClickListener = AdapterView.OnItemClickListener { _, _, position, _ ->
            val intent = Intent(this, QuestionDetailActivity::class.java)
            intent.putExtra("id", items[position].id)
            startActivity(intent)
        }
        listViewInitialized = Unit
    }
}
