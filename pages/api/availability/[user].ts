import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prisma';
import {getBusyTimes} from '../../../lib/calendarClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {user, type} = req.query;

    const currentUser = await prisma.user.findFirst({
        where: {
            username: user,
        },
        select: {
            credentials: true,
            timeZone: true
        }
    });

    const eventType = req.query.type ? await prisma.eventType.findUnique({
        where: {
            id: parseInt(type),
        }
    }) : null;

    const availability = await getBusyTimes([...currentUser.credentials, {
        type: 'internal',
        key: 'default',
        userId: currentUser.id,
        user: currentUser,
    }], req.query.dateFrom, req.query.dateTo, eventType);
    // todo check availability of existing bookings via prisma too
    res.status(200).json(availability);
}
