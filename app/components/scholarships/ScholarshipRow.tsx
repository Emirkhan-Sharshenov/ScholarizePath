type Props = {
    scholarship: any;
};

export default function ScholarshipRow({ scholarship }: Props) {
    return (
        <tr>
            <td>{scholarship.scholarshipName}</td>
            <td>{scholarship.award.type}</td>
            <td>{scholarship.deadlines?.[0]?.date}</td>
            <td>{scholarship.country}</td>
            <td>View</td>
        </tr>
    );
}