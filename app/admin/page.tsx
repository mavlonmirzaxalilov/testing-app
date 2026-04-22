'use client'
export const dynamic = 'force-dynamic'

import { ProtectedRoute } from '@/components/protected-route'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import {
	deleteTest,
	getResults,
	getTests,
	type Result,
	type Test,
} from '@/lib/appwrite'
import { databases, appwriteConfig } from '@/lib/appwrite-client'
import { BarChart3, BookOpen, Edit, Plus, Trash2, Users, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Modal komponent
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' onClick={onClose}>
			<div className='bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4' onClick={e => e.stopPropagation()}>
				<div className='flex items-center justify-between p-6 border-b'>
					<h2 className='text-xl font-bold'>{title}</h2>
					<Button variant='ghost' size='sm' onClick={onClose}>
						<X className='h-5 w-5' />
					</Button>
				</div>
				<div className='overflow-y-auto max-h-[60vh] p-6'>
					{children}
				</div>
			</div>
		</div>
	)
}

export default function AdminDashboard() {
	const { user } = useAuth()
	const [tests, setTests] = useState<Test[]>([])
	const [results, setResults] = useState<Result[]>([])
	const [users, setUsers] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	// Modal holatlari
	const [showUsersModal, setShowUsersModal] = useState(false)
	const [showResultsModal, setShowResultsModal] = useState(false)
	const [showScoresModal, setShowScoresModal] = useState(false)

	useEffect(() => {
		const loadData = async () => {
			try {
				const [testsData, resultsData, usersData] = await Promise.all([
					getTests(),
					getResults(),
					databases.listDocuments(
						appwriteConfig.databaseId,
						appwriteConfig.usersCollectionId,
					),
				])
				setTests(testsData)
				setResults(resultsData)
				setUsers(usersData.documents)
			} catch (error) {
				console.error('Error loading admin data:', error)
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [])

	const handleDeleteTest = async (testId: string) => {
		if (!confirm("Testni o'chirishni tasdiqlaysizmi?")) return
		try {
			await deleteTest(testId)
			setTests(tests.filter(t => t.id !== testId))
		} catch (error) {
			console.error('Error deleting test:', error)
		}
	}

	if (loading) {
		return (
			<ProtectedRoute adminOnly>
				<div className='container mx-auto px-4 py-8'>
					<div className='flex items-center justify-center min-h-[400px]'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	const totalUsers = new Set(results.map(r => r.userId)).size
	const averageScore =
		results.length > 0
			? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
			: 0

	// Har bir test uchun o'rtacha ball
	const testScores = tests.map(test => {
		const testResults = results.filter(r => r.testId === test.id)
		const avg = testResults.length > 0
			? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)
			: 0
		const totalQ = Object.keys(test.questions as object).length
		const percentage = totalQ > 0 ? Math.round((avg / totalQ) * 100) : 0
		return { test, avg, percentage, count: testResults.length }
	})

	return (
		<ProtectedRoute adminOnly>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-6xl mx-auto'>
					<div className='mb-8'>
						<h1 className='text-3xl font-bold mb-2'>Admin Dashboard</h1>
						<p className='text-muted-foreground'>Testlarni boshqaring va natijalarni kuzating</p>
					</div>

					{/* Stats Cards */}
					<div className='grid md:grid-cols-4 gap-6 mb-8'>
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>Jami Testlar</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex items-center gap-2'>
									<BookOpen className='h-5 w-5 text-primary' />
									<span className='text-2xl font-bold'>{tests.length}</span>
								</div>
							</CardContent>
						</Card>

						{/* Foydalanuvchilar — kliklanadigan */}
						<Card
							className='cursor-pointer hover:border-primary hover:shadow-md transition-all'
							onClick={() => setShowUsersModal(true)}
						>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>Jami Foydalanuvchilar</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex items-center gap-2'>
									<Users className='h-5 w-5 text-primary' />
									<span className='text-2xl font-bold'>{totalUsers}</span>
								</div>
							</CardContent>
						</Card>

						{/* Natijalar — kliklanadigan */}
						<Card
							className='cursor-pointer hover:border-primary hover:shadow-md transition-all'
							onClick={() => setShowResultsModal(true)}
						>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>Jami Natijalar</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex items-center gap-2'>
									<BarChart3 className='h-5 w-5 text-primary' />
									<span className='text-2xl font-bold'>{results.length}</span>
								</div>
							</CardContent>
						</Card>

						{/* O'rtacha ball — kliklanadigan */}
						<Card
							className='cursor-pointer hover:border-primary hover:shadow-md transition-all'
							onClick={() => setShowScoresModal(true)}
						>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-muted-foreground'>O'rtacha Ball</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex items-center gap-2'>
									<TrendingUp className='h-5 w-5 text-primary' />
									<span className='text-2xl font-bold'>{averageScore}</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Tests Management */}
					<Card className='mb-8'>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<div>
									<CardTitle>Testlar Boshqaruvi</CardTitle>
									<CardDescription>Testlarni yarating, tahrirlang va o'chiring</CardDescription>
								</div>
								<Link href='/admin/tests/create'>
									<Button>
										<Plus className='h-4 w-4 mr-2' />
										Yangi Test
									</Button>
								</Link>
							</div>
						</CardHeader>
						<CardContent>
							{tests.length === 0 ? (
								<div className='text-center py-8'>
									<BookOpen className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
									<h3 className='text-lg font-semibold mb-2'>Hozircha testlar yo'q</h3>
									<Link href='/admin/tests/create'>
										<Button><Plus className='h-4 w-4 mr-2' />Test Yaratish</Button>
									</Link>
								</div>
							) : (
								<div className='space-y-4'>
									{tests.map(test => {
										const testResults = results.filter(r => r.testId === test.id)
										const avgScore = testResults.length > 0
											? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)
											: 0
										return (
											<div key={test.id} className='flex items-center justify-between p-4 border rounded-lg'>
												<div className='flex-1'>
													<h3 className='font-semibold'>{test.title}</h3>
													<p className='text-sm text-muted-foreground mb-2'>{test.description}</p>
													<div className='flex items-center gap-4 text-sm text-muted-foreground'>
														<span>{Object.keys(test.questions as object).length} ta savol</span>
														<span>{test.durationMinutes} daqiqa</span>
														<span>{testResults.length} ta natija</span>
														{testResults.length > 0 && <span>O'rtacha: {avgScore} ball</span>}
													</div>
												</div>
												<div className='flex items-center gap-2'>
													<Badge variant='secondary'>Faol</Badge>
													<Link href={`/admin/tests/${test.id}/edit`}>
														<Button variant='ghost' size='sm'><Edit className='h-4 w-4' /></Button>
													</Link>
													<Button variant='ghost' size='sm' onClick={() => handleDeleteTest(test.id!)}>
														<Trash2 className='h-4 w-4' />
													</Button>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Results Overview */}
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<div>
									<CardTitle>Natijalar Ko'rish</CardTitle>
									<CardDescription>Barcha test natijalarini ko'ring</CardDescription>
								</div>
								<Link href='/admin/results'>
									<Button variant='outline'>Batafsil Ko'rish</Button>
								</Link>
							</div>
						</CardHeader>
						<CardContent>
							{results.length === 0 ? (
								<div className='text-center py-8'>
									<BarChart3 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
									<h3 className='text-lg font-semibold mb-2'>Hozircha natijalar yo'q</h3>
								</div>
							) : (
								<div className='space-y-4'>
									{results.slice(0, 5).map(result => {
										const test = tests.find(t => t.id === result.testId)
										const totalQ = test ? Object.keys(test.questions as object).length : 1
										const percentage = Math.round((result.correctCount / totalQ) * 100)
										const resultUser = users.find(u => u.$id === result.userId)
										return (
											<div key={`${result.userId}_${result.testId}_${result.completedAt}`} className='flex items-center justify-between p-3 border rounded-lg'>
												<div>
													<div className='font-medium'>{test?.title || 'Test topilmadi'}</div>
													<div className='text-sm text-muted-foreground'>
														{resultUser ? `${resultUser.firstName} ${resultUser.lastName}` : result.userId} • {new Date(result.completedAt).toLocaleDateString('uz-UZ')}
													</div>
												</div>
												<div className='text-right'>
													<div className='font-semibold'>{result.correctCount} / {totalQ}</div>
													<div className='text-sm text-muted-foreground'>{percentage}%</div>
												</div>
											</div>
										)
									})}
									{results.length > 5 && (
										<div className='text-center pt-4'>
											<Button variant='outline' onClick={() => setShowResultsModal(true)}>
												Barcha natijalarni ko'rish ({results.length})
											</Button>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* MODAL: Foydalanuvchilar */}
			{showUsersModal && (
				<Modal title={`Foydalanuvchilar (${users.length})`} onClose={() => setShowUsersModal(false)}>
					{users.length === 0 ? (
						<p className='text-muted-foreground text-center py-8'>Foydalanuvchilar yo'q</p>
					) : (
						<div className='space-y-3'>
							{users.map((u, i) => {
								const userResults = results.filter(r => r.userId === u.$id)
								return (
									<div key={u.$id} className='flex items-center justify-between p-3 border rounded-lg'>
										<div className='flex items-center gap-3'>
											<div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm'>
												{i + 1}
											</div>
											<div>
												<div className='font-medium'>{u.firstName} {u.lastName}</div>
												<div className='text-sm text-muted-foreground'>{u.email}</div>
											</div>
										</div>
										<div className='text-right'>
											<Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
												{u.role === 'admin' ? 'Admin' : 'User'}
											</Badge>
											<div className='text-xs text-muted-foreground mt-1'>{userResults.length} ta natija</div>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</Modal>
			)}

			{/* MODAL: Natijalar */}
			{showResultsModal && (
				<Modal title={`Barcha Natijalar (${results.length})`} onClose={() => setShowResultsModal(false)}>
					{results.length === 0 ? (
						<p className='text-muted-foreground text-center py-8'>Natijalar yo'q</p>
					) : (
						<div className='space-y-3'>
							{results.map((result, i) => {
								const test = tests.find(t => t.id === result.testId)
								const totalQ = test ? Object.keys(test.questions as object).length : 1
								const percentage = Math.round((result.correctCount / totalQ) * 100)
								const resultUser = users.find(u => u.$id === result.userId)
								return (
									<div key={`${result.userId}_${result.testId}_${result.completedAt}_${i}`} className='flex items-center justify-between p-3 border rounded-lg'>
										<div>
											<div className='font-medium'>{test?.title || 'Test topilmadi'}</div>
											<div className='text-sm text-muted-foreground'>
												{resultUser ? `${resultUser.firstName} ${resultUser.lastName}` : result.userId}
											</div>
											<div className='text-xs text-muted-foreground'>
												{new Date(result.completedAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
											</div>
										</div>
										<div className='text-right'>
											<div className='font-bold text-lg'>{result.correctCount}/{totalQ}</div>
											<div className={`text-sm font-medium ${percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
												{percentage}%
											</div>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</Modal>
			)}

			{/* MODAL: Har bir test o'rtachasi */}
			{showScoresModal && (
				<Modal title="Testlar Bo'yicha O'rtacha Ball" onClose={() => setShowScoresModal(false)}>
					{testScores.length === 0 ? (
						<p className='text-muted-foreground text-center py-8'>Testlar yo'q</p>
					) : (
						<div className='space-y-4'>
							{testScores.map(({ test, avg, percentage, count }) => (
								<div key={test.id} className='p-4 border rounded-xl'>
									<div className='flex items-start justify-between mb-3'>
										<div className='flex-1'>
											<div className='font-semibold'>{test.title}</div>
											<div className='text-sm text-muted-foreground'>{count} ta natija</div>
										</div>
										<div className='text-right'>
											<div className='text-2xl font-bold text-primary'>{avg}</div>
											<div className='text-sm text-muted-foreground'>ball</div>
										</div>
									</div>
									{/* Progress bar */}
									<div className='w-full bg-muted rounded-full h-2'>
										<div
											className={`h-2 rounded-full transition-all ${percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
											style={{ width: `${percentage}%` }}
										/>
									</div>
									<div className='text-xs text-muted-foreground mt-1 text-right'>{percentage}%</div>
								</div>
							))}
						</div>
					)}
				</Modal>
			)}
		</ProtectedRoute>
	)
}
