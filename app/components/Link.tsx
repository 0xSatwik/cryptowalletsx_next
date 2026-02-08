import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

// Define a type that combines Next.js LinkProps with standard anchor attributes
// Explicitly include children and ensure href is handled correctly
type CustomLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
};

const Link = ({ children, ...props }: CustomLinkProps) => {
    return (
        <NextLink {...props} prefetch={false}>
            {children}
        </NextLink>
    );
};

export default Link;
