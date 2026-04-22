'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogOut, User, BookOpen } from 'lucide-react'
import Link from 'next/link'

export function Header() {
	const { user, logout } = useAuth()

	return (
		<header className='border-b bg-card'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex items-center justify-between'>
					<Link href='/' className='flex items-center gap-2 font-bold text-xl'>
						<BookOpen className='h-6 w-6 text-primary' />
						Test Platform
					</Link>

					<div className='flex items-center gap-4'>
						<ThemeToggle />

						{user ? (
							<div className='flex items-center gap-3'>
								<div className='flex items-center gap-2 text-sm'>
									<User className='h-4 w-4' />
									<span>{user.displayName || user.email}</span>
									{user.role === 'admin' && (
										<span className='bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs'>
											Admin
										</span>
									)}
								</div>
								<Button variant='ghost' size='sm' onClick={logout}>
									<LogOut className='h-4 w-4 mr-2' />
									Chiqish
								</Button>
							</div>
						) : (
							<div className='flex items-center gap-2'>
								<Link href='/auth/signin'>
									<Button variant='ghost' size='sm'>
										Kirish
									</Button>
								</Link>
								<Link href='/auth/signup'>
									<Button size='sm'>Ro'yxatdan o'tish</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}
