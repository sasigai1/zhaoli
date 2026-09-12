package com.adas.interviewprep

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.BaseAdapter
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView

class KnowledgeListActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        title = "知识库"
        setContentView(R.layout.activity_list)

        val header = findViewById<TextView>(R.id.list_header)
        header.text = "📚 知识库 · ${DataStore.knowledge.size}个核心知识点"

        val items = DataStore.knowledge
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
                val item = items[position]
                holder.first.text = item.title
                holder.second.text = item.category
                return row
            }
        }
        listView.onItemClickListener = AdapterView.OnItemClickListener { _, _, position, _ ->
            val intent = Intent(this, KnowledgeDetailActivity::class.java)
            intent.putExtra("id", items[position].id)
            startActivity(intent)
        }
    }
}
