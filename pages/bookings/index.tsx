import Head from 'next/head';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import Shell from '../../components/Shell';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { useState } from 'react';
import { useSession, getSession } from 'next-auth/client';

export default function Booking(props) {
    const [ session, loading ] = useSession();
    const router = useRouter();

    if (loading) {
        return <p className="text-gray-400">Loading...</p>;
    }

    return(
        <div>
            <Head>
                <title>Bookings | Calendso</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Shell heading="Bookings">
                <div className="flex flex-col mb-8">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date and Time
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attendees
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {props.bookings.map((booking) =>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {booking.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.startTime.toLocaleDateString()} {booking.startTime.toLocaleTimeString()} - {booking.endTime.toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.attendees.email}
                                                {booking.attendees.map((booking) =>
                                                    <span>{booking.email}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={"/" + props.user.username + "/" + booking.id}><a target="_blank" className="text-blue-600 hover:text-blue-900 mr-2">View</a></Link>
                                                <Link href={"/availability/event/" + booking.id}><a className="text-blue-600 hover:text-blue-900">Edit</a></Link>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </Shell>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return { redirect: { permanent: false, destination: '/auth/login' } };
    }

    const user = await prisma.user.findFirst({
        where: {
            email: session.user.email,
        },
        select: {
            id: true,
            username: true,
            startTime: true,
            endTime: true
        }
    });

    const credentials = await prisma.credential.findMany({
        where: {
            userId: user.id,
        },
        select: {
            type: true
        }
    });

    const bookings = await prisma.booking.findMany({
        where: {
            userId: user.id,
        },
        select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            attendees: true,
        }
    });


    return {
        props: {user, bookings}, // will be passed to the page component as props
    }
}