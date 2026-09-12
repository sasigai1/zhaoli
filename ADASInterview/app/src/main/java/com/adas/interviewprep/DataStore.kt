package com.adas.interviewprep

import android.content.Context
import org.json.JSONObject

object DataStore {

    lateinit var categories: List<String>
        private set
    lateinit var questions: List<Question>
        private set
    lateinit var knowledge: List<KnowledgeItem>
        private set
    lateinit var guideSections: List<GuideSection>
        private set

    private var initialized = false

    fun init(context: Context) {
        if (initialized) return
        val appContext = context.applicationContext

        val qJson = JSONObject(readAsset(appContext, "questions.json"))
        val catsArray = qJson.getJSONArray("categories")
        categories = (0 until catsArray.length()).map { catsArray.getString(it) }
        val qArray = qJson.getJSONArray("questions")
        questions = (0 until qArray.length()).map { i ->
            val o = qArray.getJSONObject(i)
            Question(
                id = o.getInt("id"),
                category = o.getString("category"),
                difficulty = o.getInt("difficulty"),
                question = o.getString("question"),
                answer = o.getString("answer")
            )
        }

        val kJson = JSONObject(readAsset(appContext, "knowledge.json"))
        val kArray = kJson.getJSONArray("sections")
        knowledge = (0 until kArray.length()).map { i ->
            val o = kArray.getJSONObject(i)
            KnowledgeItem(
                id = o.getInt("id"),
                category = o.getString("category"),
                title = o.getString("title"),
                content = o.getString("content")
            )
        }

        val gJson = JSONObject(readAsset(appContext, "resume_guide.json"))
        val gArray = gJson.getJSONArray("sections")
        guideSections = (0 until gArray.length()).map { i ->
            val o = gArray.getJSONObject(i)
            GuideSection(o.getString("title"), o.getString("content"))
        }

        initialized = true
    }

    private fun readAsset(context: Context, name: String): String =
        context.assets.open(name).bufferedReader(Charsets.UTF_8).use { it.readText() }

    // ---- progress persistence ----

    private fun prefs(context: Context) =
        context.getSharedPreferences("progress", Context.MODE_PRIVATE)

    private fun getIdSet(context: Context, key: String): MutableSet<Int> =
        prefs(context).getStringSet(key, emptySet())!!.map { it.toInt() }.toMutableSet()

    private fun saveIdSet(context: Context, key: String, ids: Set<Int>) {
        prefs(context).edit().putStringSet(key, ids.map { it.toString() }.toSet()).apply()
    }

    fun isFavorite(context: Context, id: Int) = getIdSet(context, "favorites").contains(id)
    fun isMastered(context: Context, id: Int) = getIdSet(context, "mastered").contains(id)
    fun isWrong(context: Context, id: Int) = getIdSet(context, "wrong").contains(id)

    fun toggleFavorite(context: Context, id: Int): Boolean {
        val set = getIdSet(context, "favorites")
        val added = if (set.contains(id)) { set.remove(id); false } else { set.add(id); true }
        saveIdSet(context, "favorites", set)
        return added
    }

    fun markMastered(context: Context, id: Int) {
        val m = getIdSet(context, "mastered"); m.add(id); saveIdSet(context, "mastered", m)
        val w = getIdSet(context, "wrong"); w.remove(id); saveIdSet(context, "wrong", w)
    }

    fun markWrong(context: Context, id: Int) {
        val w = getIdSet(context, "wrong"); w.add(id); saveIdSet(context, "wrong", w)
        val m = getIdSet(context, "mastered"); m.remove(id); saveIdSet(context, "mastered", m)
    }

    fun unmark(context: Context, id: Int) {
        val w = getIdSet(context, "wrong"); w.remove(id); saveIdSet(context, "wrong", w)
        val m = getIdSet(context, "mastered"); m.remove(id); saveIdSet(context, "mastered", m)
    }

    fun favorites(context: Context): List<Question> {
        val ids = getIdSet(context, "favorites")
        return questions.filter { ids.contains(it.id) }
    }

    fun wrongQuestions(context: Context): List<Question> {
        val ids = getIdSet(context, "wrong")
        return questions.filter { ids.contains(it.id) }
    }

    fun masteredCount(context: Context) = getIdSet(context, "mastered").size
    fun favoriteCount(context: Context) = getIdSet(context, "favorites").size
    fun wrongCount(context: Context) = getIdSet(context, "wrong").size

    fun incrementQuizRounds(context: Context) {
        val p = prefs(context)
        p.edit().putInt("quiz_rounds", p.getInt("quiz_rounds", 0) + 1).apply()
    }

    fun incrementMockCount(context: Context) {
        val p = prefs(context)
        p.edit().putInt("mock_count", p.getInt("mock_count", 0) + 1).apply()
    }

    fun quizRounds(context: Context) = prefs(context).getInt("quiz_rounds", 0)
    fun mockCount(context: Context) = prefs(context).getInt("mock_count", 0)

    fun lastStudiedIds(context: Context): List<Int> =
        prefs(context).getString("last_ids", "")!!
            .split(",").filter { it.isNotBlank() }.map { it.toInt() }

    fun saveLastStudiedIds(context: Context, ids: List<Int>) {
        prefs(context).edit().putString("last_ids", ids.joinToString(",")).apply()
    }
}
