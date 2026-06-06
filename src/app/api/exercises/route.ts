import { NextRequest, NextResponse } from "next/server";
import { getExercises } from "@/lib/exercises";
import { getTopic } from "@/data/vocabulary";

export async function POST(request: NextRequest) {
  try {
    const { topic_id, level = 1, count = 5 } = await request.json();

    if (!topic_id || typeof topic_id !== "string") {
      return NextResponse.json(
        { error: "topic_id es requerido" },
        { status: 400 },
      );
    }

    const topic = getTopic(topic_id);
    if (!topic) {
      return NextResponse.json(
        { error: `Tema "${topic_id}" no encontrado` },
        { status: 404 },
      );
    }

    const validLevel = Math.min(Math.max(1, Number(level) || 1), 5);
    const validCount = Math.min(Math.max(1, Number(count) || 5), 10);

    const exercises = await getExercises(topic_id, validLevel, validCount);

    return NextResponse.json({
      topic: {
        id: topic.id,
        name: topic.name,
        icon: topic.icon,
      },
      level: validLevel,
      exercises,
    });
  } catch (error) {
    console.error("Exercises API error:", error);

    return NextResponse.json(
      { error: "Algo salió mal generando los ejercicios. ¡Intentalo de nuevo!" },
      { status: 500 },
    );
  }
}
