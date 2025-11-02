import cx from 'classnames';

export default function LoadingButton({ loading, className, children, ...props }) {
  const buttonClass = cx(
    'flex items-center',
    'focus:outline-none',
    {
      'pointer-events-none bg-opacity-75 select-none': loading,
    },
    className
  );

  return (
    <button disabled={loading} className={buttonClass} {...props}>
      {loading && <div className="mr-2 btn-spinner" />}
      {children}
    </button>
  );
}
