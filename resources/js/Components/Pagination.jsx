import { Link } from '@inertiajs/react';
import classNames from 'classnames';

export default function Pagination({ links = [] }) {
  // Si seulement 3 liens, pas de pagination à afficher
  if (links.length === 3) return null;

  return (
    <div className="flex flex-wrap mt-6 -mb-1">
      {links?.map((link) => {
        return link?.url === null ? (
          <PageInactive key={link.label} label={link.label} />
        ) : (
          <PaginationItem key={link.label} {...link} />
        );
      })}
    </div>
  );
}

function PaginationItem({ active, label, url }) {
  const className = classNames(
    [
      'mr-1 mb-1',
      'px-4 py-3',
      'border border-solid border-gray-300 rounded',
      'text-sm',
      'hover:bg-white',
      'focus:outline-none focus:border-indigo-700 focus:text-indigo-700',
    ],
    {
      'bg-white': active,
    }
  );

  return (
    <Link className={className} href={url}>
      <span dangerouslySetInnerHTML={{ __html: label }}></span>
    </Link>
  );
}

function PageInactive({ label }) {
  const className = classNames(
    'mr-1 mb-1 px-4 py-3 text-sm border rounded border-solid border-gray-300 text-gray'
  );

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: label }} />
  );
}
