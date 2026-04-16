import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServices } from '@/lib/context'
import { decryptUserId } from '@/server/utils/sessionCrypto'

interface BrandAsset {
  alt: string
  kind: 'local-wordmark' | 'remote-wordmark' | 'sms-image'
  src: string
}

export default async function WelcomePage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('gt_user_session')

  if (!sessionCookie) {
    redirect('/me/login')
  }

  const userId = decryptUserId(sessionCookie.value)

  if (!userId) {
    redirect('/me/login')
  }

  const services = getServices()
  const [user, enrollment] = await Promise.all([
    services.user.getUserById(userId),
    services.enrollment.getActiveEnrollment(userId),
  ])

  if (!user) {
    redirect('/api/auth/logout?redirect=/start')
  }

  const program = enrollment ? await services.program.getById(enrollment.programId) : null
  const owner = program ? await services.programOwner.getById(program.ownerId) : null
  const productName = program?.name || 'GymText'
  const firstName = user.name?.trim().split(/\s+/)[0] || 'there'
  const brandAsset = getBrandAsset({
    ownerDisplayName: owner?.displayName ?? null,
    ownerWordmarkUrl: owner?.wordmarkUrl ?? null,
    programLogoUrl: program?.logoUrl ?? null,
    programName: program?.name ?? null,
    smsImageUrl: program?.smsImageUrl ?? null,
  })

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4efe8] text-[#16120d]">
      <div className="relative isolate flex min-h-screen items-center justify-center px-6 py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(214,166,112,0.26),_transparent_38%),linear-gradient(180deg,_#fbf7f1_0%,_#efe5d8_100%)]" />
        <div className="absolute left-[-8rem] top-[-6rem] -z-10 h-72 w-72 rounded-full bg-[#d6a670]/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] -z-10 h-80 w-80 rounded-full bg-[#7f8f73]/16 blur-3xl" />

        <div className="w-full max-w-4xl rounded-[2rem] border border-black/5 bg-white/80 px-8 py-10 text-center shadow-[0_24px_80px_rgba(31,24,18,0.10)] backdrop-blur sm:px-14 sm:py-14">
          <div className="mb-8 flex min-h-24 items-center justify-center sm:mb-10 sm:min-h-28">
            {brandAsset.kind === 'local-wordmark' ? (
              <Image
                src={brandAsset.src}
                alt={brandAsset.alt}
                width={300}
                height={64}
                priority
                className="h-12 w-auto sm:h-14"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandAsset.src}
                alt={brandAsset.alt}
                className={brandAsset.kind === 'sms-image'
                  ? 'max-h-24 w-auto max-w-full rounded-2xl object-contain shadow-[0_10px_30px_rgba(31,24,18,0.10)] sm:max-h-28'
                  : 'h-14 w-auto max-w-full object-contain sm:h-16'
                }
              />
            )}
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-[#9b7c5c] sm:mb-4 sm:text-sm">
            You&apos;re in
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome to
          </h1>
          <p className="mx-auto mt-3 max-w-[14ch] text-balance text-4xl font-semibold leading-[0.95] tracking-tight sm:max-w-[16ch] sm:text-6xl">
            {productName}
          </p>
          <p className="mx-auto mt-6 max-w-[38rem] text-pretty text-base leading-7 text-[#5c5247] sm:mt-7 sm:text-lg">
            {firstName}, your first workout should arrive shortly. Feel free to text me anytime if
            you want help, need a change, or just want to tell me how training is going.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-5">
            <Link
              href="/me"
              className="inline-flex h-11 min-w-56 items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-8 text-base font-medium text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-[0_14px_30px_rgba(59,99,241,0.22)]"
            >
              Open my dashboard
            </Link>
            <Link
              href="/me"
              className="text-sm font-medium text-[#6e6255] underline-offset-4 transition hover:text-[#16120d] hover:underline"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function getBrandAsset({
  ownerDisplayName,
  ownerWordmarkUrl,
  programLogoUrl,
  programName,
  smsImageUrl,
}: {
  ownerDisplayName: string | null
  ownerWordmarkUrl: string | null
  programLogoUrl: string | null
  programName: string | null
  smsImageUrl: string | null
}): BrandAsset {
  if (ownerWordmarkUrl) {
    return {
      src: ownerWordmarkUrl,
      alt: ownerDisplayName ? `${ownerDisplayName} wordmark` : 'Program wordmark',
      kind: 'remote-wordmark',
    }
  }

  if (programLogoUrl) {
    return {
      src: programLogoUrl,
      alt: programName ? `${programName} wordmark` : 'Program wordmark',
      kind: 'remote-wordmark',
    }
  }

  if (smsImageUrl) {
    return {
      src: smsImageUrl,
      alt: programName ? `${programName} welcome image` : 'Program welcome image',
      kind: 'sms-image',
    }
  }

  return {
    src: '/Wordmark.png',
    alt: 'GymText',
    kind: 'local-wordmark',
  }
}
