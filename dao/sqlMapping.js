module.exports = {
    hospital: {
        insert: 'insert Hospital set ?',
        insertPatient: 'insert Patient set ?',
        updateShiftPlan: 'update ShiftPlan set actualQuantity = actualQuantity + 1 where doctorId = ? and day =? and shiftPeriod = ?',
        findShiftPlanByDoctorAndShiftPeriod: 'select * from ShiftPlan where doctorId=? and day=? and shiftPeriod =?',
        findBySalesManPatientById: 'select * from SalesManPatient where id=?',
        findPatientBasicInfoBy: 'select * from PatientBasicInfo where mobile=?',
        findPatientByBasicInfoId: 'select * from Patient where patientBasicInfoId = ? and hospitalId=?',
        insertPatientBasicInfo: 'insert PatientBasicInfo set ?',
        update: 'update Hospital set ? where id=?',
        findById: 'select id, name, tag, images, address, icon, introduction, customerServiceUid, contactMobile, contact,telephone, trafficRoute from Hospital where id = ?',
        insertRegistration: 'insert Registration set ?',
        findShiftPeriodById: 'select * from ShiftPeriod where hospitalId = ? and id =?',
        findRegistrations: 'select patientMobile, patientName, departmentName, doctorName, r.recipeFee, r.recommendationFee, r.preScriptionFee, r.hospitalName,r.outpatientStatus, createDate, totalFee as amount, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , p.`name`) as shiftPeriod from Registration r left JOIN ShiftPeriod p on r.shiftPeriod = p.id where r.businessPeopleId =? ',
        findDoctorById: 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,introduction, images,jobTitle, departmentId, jobTitleId,commentCount from Doctor where id =?',
        findByDepartment: 'select id, name, departmentName, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where hospitalId = ?  and departmentId = ?',
        findShitPlans: 'select p.`name` as period, `day`, actualQuantity, plannedQuantity, p.id as periodId from ShiftPlan sp, ShiftPeriod p where sp.shiftPeriod = p.id and sp.doctorId = ? and sp.day>? and sp.day<=? and sp.actualQuantity < sp.plannedQuantity and sp.plannedQuantity > 0 order by sp.day, sp.shiftPeriod',
        findByHospital: 'select id, name, introduction from Department where hospitalId = ?',
        findAll: 'select SQL_CALC_FOUND_ROWS h.*, e.name as administratorName from Hospital h left JOIN Employee e on e.id = h.administrator order by h.createDate desc limit ?, ?'
    },
    angelGuider: {
        findAll: 'select id, name, headPic, gender, mobile, realName, status from AngelGuider where agency = ? order by createDate desc',
        findByKeywords: 'select id, name, headPic, gender, mobile, realName, status from AngelGuider where agency = ? and (mobile like ? or realName like ?) order by createDate desc',
        findByUserName: 'select * from AngelGuider where name = ?',
        updatePassword: 'update AngelGuider set password=? where name=?',
        update: 'update angelGuider set ? where id=?',
        updateCheckInCount: 'update angelGuider set checkInCount = checkInCount + 1 where id=?',
        insertAngelGuider: 'insert AngelGuider set ?',
        updateAngelGuider: 'update AngelGuider set ? where id = ?',
        removeAngelGuider: 'delete from AngelGuider  where id = ?',
        findById: 'select * from AngelGuider where id = ?',
        findAccount: 'select ag.realName, bank,account, accountName, ac.balance, ac.availableBalance, ag.headPic from AngelGuider ag left join Account ac on ag.id = ac.uid where ag.id = ?'
    },
    device: {
        insert: 'insert AngelGuiderDevice set ?',
        findByToken: 'select * from AngelGuider where token = ?',
        update: 'update AngelGuiderDevice set ? where id =?',
        findTokenByUid: 'select token from AngelGuiderDevice where uid=?',
        findByUid: 'select * from AngelGuiderDevice where uid=?'
    },
    notification: {
        insert: 'insert AngelGuiderNotification set ?',
        findAll: 'select * from AngelGuiderNotification where uid=? order by id desc limit ?, ?',
        update: 'update AngelGuiderNotification set ? where id =?',
        delete: 'delete from AngelGuiderNotification where id =?'
    },
    account: {
        insert: 'insert Account set ?',
        findBankByBinCode: 'select * from BinCode where binCode = ?',
        insertWithDrawApplication: 'insert AngelGuiderWithdrawApplication set ?',
        findBills: 'select f.id, flowNo,f.createDate, f.`comment`, amount, hospitalName, r.businessPeopleName from AngelGuiderTransactionFlow f left join Registration r on f.registrationId = r.id where f.uid=?'
    }
}
