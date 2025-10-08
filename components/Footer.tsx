'use client'

export default function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer className='w-full border-t border-border bg-background text-foreground py-4 px-4'>
			<div className='container mx-auto flex flex-col sm:flex-row items-center justify-between text-sm'>
				<span>Barcha huquqlar himoyalangan.</span>
				<span>
					Mualliflar:{' '}
					<strong>
						<a href='https://t.me/mohinur_qosimova98' target='_blank'>Qosimova Mohinur</a>
					</strong>
					{' va '}
					<strong>
						<a href='https://t.me/dadaboyeva_feruzaxon' target='_blank'>
							Dadaboyeva Feruzaxon
						</a>
					</strong>
				</span>
				<span>Copyright&copy; {year}</span>
			</div>
		</footer>
	)
}
