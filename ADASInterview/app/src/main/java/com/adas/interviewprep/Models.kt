package com.adas.interviewprep

data class Question(
    val id: Int,
    val category: String,
    val difficulty: Int,
    val question: String,
    val answer: String
)

data class KnowledgeItem(
    val id: Int,
    val category: String,
    val title: String,
    val content: String
)

data class GuideSection(
    val title: String,
    val content: String
)
