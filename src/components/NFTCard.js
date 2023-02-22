import Image from 'next/image';

const NFTCard = ({ data }) => {
	const name = data?.title;
	const format = data?.media[0]?.format || 'image';
	const mediaUrl = data?.media[0]?.gateway;
	const tokenId = data?.tokenId;
	const tokenType = data?.tokenType;
	const displayName = name || `${tokenType} #${tokenId}`;
	const description = data?.description || 'no description';

	return (
		<div className="card card-bordered card-compact lg:card-normal">
			<figure>
				{format === 'mp4' && <video src={mediaUrl} width="270" height="270" alt={`${displayName} video`} />}
				{format !== 'mp4' && <Image src={mediaUrl} width="270" height="270" alt={`${displayName} image`} />}
			</figure>
			<div className="card-body">
				<h2 className="card-title">{displayName}</h2>
				{tokenType && (
					<div className="badge badge-gost" size="sm">
						{tokenType}
					</div>
				)}
				<p className="text-sm truncate">{description}</p>
			</div>
		</div>
	);
};

export default NFTCard;
