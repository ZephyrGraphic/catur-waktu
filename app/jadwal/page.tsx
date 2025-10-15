"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  deadline: string
  notes: string
  mentor: string
  soundNotification: boolean
  completed: boolean
}

export default function JadwalPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    const tasksData = localStorage.getItem("catur_waktu_tasks")
    if (tasksData) {
      setTasks(JSON.parse(tasksData))
    }
  }, [])

  const tasksForDate = tasks.filter((task) => {
    const taskDate = new Date(task.deadline).toISOString().split("T")[0]
    return taskDate === selectedDate
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-card">
        <Link href="/beranda">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Jadwal</h1>
      </header>

      <div className="p-4 space-y-6 pb-20">
        {/* Calendar Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Pilih Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border rounded-lg bg-background"
            />
          </CardContent>
        </Card>

        {/* Tasks for Selected Date */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Jadwal untuk{" "}
            {new Date(selectedDate).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>

          <div className="space-y-3">
            {tasksForDate.length > 0 ? (
              tasksForDate.map((task) => (
                <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <ClockIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(task.deadline).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {task.notes && <p className="text-sm text-muted-foreground mt-2">{task.notes}</p>}
                        {task.mentor && <p className="text-sm text-primary mt-1">Mentor: {task.mentor}</p>}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${task.completed ? "bg-green-500" : "bg-accent"}`} />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Tidak ada jadwal untuk tanggal ini</p>
                    <p className="text-sm text-muted-foreground">Pilih tanggal lain atau tambah tugas baru</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="flex items-center justify-around py-2">
          <Link href="/beranda" className="flex flex-col items-center p-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-1">Beranda</span>
          </Link>

          <Link href="/jadwal" className="flex flex-col items-center p-2 text-primary">
            <CalendarIcon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Jadwal</span>
          </Link>

          <Link href="/riwayat" className="flex flex-col items-center p-2 text-muted-foreground">
            <ClockIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Riwayat</span>
          </Link>

          <Link href="/profil" className="flex flex-col items-center p-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
