import Link from 'next/link';
import { Menu } from '@headlessui/react';
import { useAccount } from 'wagmi';
import useIsMounted from '@/lib/useIsMounted';
import ThemeSwitch from './ThemeSwitch';
import SignInButton from './SigninButton';
import shortenAddress from '@/lib/shortenAddress';

const Header = ({ siweSession, setSiweSession }) => {
	const isMounted = useIsMounted();
	const { isConnected } = useAccount();

	return (
        <header className="shadow-xl navbar bg-base-100">
			<div className="flex-1">
				<Link href="/" className="text-xl normal-case btn btn-ghost">
					MantleFolio
				</Link>
			</div>
			<div className="flex-none">
				{isMounted && isConnected && siweSession?.address && (
					<div className="flex items-center justify-center">
						<div className="pr-2 text-xs">Signed in: {shortenAddress(siweSession.address)}</div>
						<button
							className="btn btn-xs"
							onClick={async () => {
								await fetch('/api/logout');
								setSiweSession({});
							}}
						>
							Sign Out
						</button>
					</div>
				)}
				{isMounted && isConnected && !siweSession?.address && (
					<SignInButton
						onSuccess={({ address }) => setSiweSession(x => ({ ...x, address }))}
						onError={({ error }) => setSiweSession(x => ({ ...x, error }))}
					/>
				)}
				<ThemeSwitch />
			</div>
		</header>
    );
};

export default Header;
