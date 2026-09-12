package com.adas.interviewprep

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView

class GuideActivity : Activity() {

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        DataStore.init(this)
        title = "简历攻略"
        setContentView(R.layout.activity_guide)

        val container = findViewById<LinearLayout>(R.id.guide_container)
        container.removeAllViews()

        DataStore.guideSections.forEach { section ->
            val card = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                background = getDrawable(R.drawable.bg_card)
                setPadding(dp(16), dp(16), dp(16), dp(16))
            }
            card.addView(TextView(this).apply {
                text = section.title
                textSize = 18f
                setTextColor(getColor(R.color.accent))
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            })
            card.addView(TextView(this).apply {
                text = section.content
                textSize = 14f
                setTextColor(getColor(R.color.text_primary))
                setLineSpacing(0f, 1.35f)
                setPadding(0, dp(10), 0, 0)
            })
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
            lp.bottomMargin = dp(12)
            container.addView(card, lp)
        }
    }
}
