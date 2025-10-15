"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, ClockIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react"
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

export default function RiwayatPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const tasksData = localStorage.getItem("catur_waktu_tasks")
    if (tasksData) {
      setTasks(JSON.parse(tasksData))
    }
  }, [])

  const completedTasks = tasks.filter((task) => task.completed)
  const allTasks = [...tasks].sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-card">
        <Link href="/beranda">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Riwayat</h1>
      </header>

      <div className="p-4 space-y-6 pb-20">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Selesai</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Tasks History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Semua Aktivitas</h2>

          <div className="space-y-3">
            {allTasks.length > 0 ? (
              allTasks.map((task) => (
                <Card key={task.id} className={task.completed ? "border-green-200 bg-green-50/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                          task.completed ? "bg-green-500" : "bg-muted"
                        }`}
                      >
                        {task.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? "text-green-700" : ""}`}>{task.title}</h3>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(task.deadline).toLocaleDateString("id-ID")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>
                              {new Date(task.deadline).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {task.notes && <p className="text-sm text-muted-foreground mt-2">{task.notes}</p>}

                        {task.mentor && <p className="text-sm text-primary mt-1">Mentor: {task.mentor}</p>}

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.completed
                                ? "bg-green-100 text-green-700"
                                : new Date(task.deadline) < new Date()
                                  ? "bg-red-100 text-red-700"
                                  : "bg-accent/20 text-accent-foreground"
                            }`}
                          >
                            {task.completed
                              ? "Selesai"
                              : new Date(task.deadline) < new Date()
                                ? "Terlambat"
                                : "Dalam Proses"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <ClockIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Belum ada riwayat aktivitas</p>
                    <p className="text-sm text-muted-foreground">Mulai tambah tugas untuk melihat riwayat</p>
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

          <Link href="/jadwal" className="flex flex-col items-center p-2 text-muted-foreground">
            <CalendarIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Jadwal</span>
          </Link>

          <Link href="/riwayat" className="flex flex-col items-center p-2 text-primary">
            <ClockIcon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Riwayat</span>
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
