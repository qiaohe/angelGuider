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
        findById: 'select id, name, tag, recipeShare ,prescriptionShare, recommendationFee, images, address, icon, introduction, customerServiceUid, contactMobile, contact,telephone, trafficRoute from Hospital where id = ?',
        insertRegistration: 'insert Registration set ?',
        findShiftPeriodById: 'select * from ShiftPeriod where hospitalId = ? and id =?',
        findRegistrations: 'select r.id,r.hospitalId,patientMobile,r.gender,patientName, departmentName, doctorName, r.recipeFee, r.recommendationFee, r.preScriptionFee, r.hospitalName,r.outpatientStatus, createDate, totalFee as amount, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , p.`name`) as shiftPeriod, r.hasFeedback from Registration r left JOIN ShiftPeriod p on r.shiftPeriod = p.id where r.businessPeopleId =? ',
        findDoctorById: 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,introduction, images,jobTitle, departmentId, jobTitleId,commentCount from Doctor where id =?',
        findByDepartment: 'select id, name, departmentName, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where hospitalId = ?  and departmentId = ?',
        findShitPlans: 'select p.`name` as period, `day`, actualQuantity, plannedQuantity, p.id as periodId from ShiftPlan sp, ShiftPeriod p where sp.shiftPeriod = p.id and sp.doctorId = ? and sp.day>? and sp.day<=? and sp.actualQuantity < sp.plannedQuantity and sp.plannedQuantity > 0 order by sp.day, sp.shiftPeriod',
        findByHospital: 'select id, name, introduction from Department where hospitalId = ? and isRegister=1',
        findAll: 'select SQL_CALC_FOUND_ROWS h.*, e.name as administratorName from Hospital h left JOIN Employee e on e.id = h.administrator order by h.createDate desc limit ?, ?'
    },
    angelGuider: {
        findAll: 'select id, name, headPic, gender, mobile, realName, status from AngelGuider where agency = ? order by createDate desc',
        findByKeywords: 'select id, name, headPic, gender, mobile, realName, status from AngelGuider where agency = ? and (mobile like ? or realName like ?) order by createDate desc',
        findByUserName: 'select * from AngelGuider where name = ? or mobile = ?',
        findByMobile: 'select * from AngelGuider where mobile = ?',
        findByInvitationCode: 'select * from AngelGuider where invitationCode = ?',
        updatePassword: 'update AngelGuider set password=? where name=?',
        update: 'update AngelGuider set ? where id=?',
        updateCheckInCount: 'update angelGuider set checkInCount = checkInCount + 1 where id=?',
        insertAngelGuider: 'insert AngelGuider set ?',
        updateAngelGuider: 'update AngelGuider set ? where id = ?',
        removeAngelGuider: 'delete from AngelGuider  where id = ?',
        findById: 'select * from AngelGuider where id = ?',
        insert: 'insert AngelGuider set ?',
        findAccount: 'select ag.realName, bank,branch, account, ag.accountName, ac.balance, ac.availableBalance, ag.headPic from AngelGuider ag left join Account ac on ag.id = ac.uid where ag.id = ? AND ac.type = 0'
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
        updateWithDrawApplication: 'update AngelGuiderWithdrawApplication set ? where id = ?',
        findBills: 'select f.id, flowNo,f.createDate,f.updateDate,ag.bank, ag.account, f.`comment`, f.amount, s.hospitalName,r.businessPeopleName, s.patientName,IF(f.transactionCode = 106, a.`status`, f.`status`) as `status`, f.type, s.type as feeType,concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \'), p.`name`) as shiftPeriod  from AngelGuiderTransactionFlow f left join AngelGuiderShare s on f.shareId = s.id and f.transactionCode <> 106 left JOIN Registration r on r.id = s.registrationId left join ShiftPeriod p on p.id = r.shiftPeriod left join AngelGuider ag on ag.id = f.uid and f.transactionCode = 106 left JOIN AngelGuiderWithdrawApplication a on a.transactionFlowId= f.id and f.transactionCode = 106 where f.uid=? and f.transactionCode > 105 order BY f.createDate DESC'
    },
    feedback: {
        insert: 'insert Feedback set ?',
        findByRegistrationId: 'select * from Feedback where registrationId = ?',
        updateRegistrationFeedback: 'update Registration set hasFeedback = ? where id = ?',
        findActivities: 'select * from Activity'
    },
    registration: {
        findById: 'select * from Registration where id =?',
        updateShiftPlanDec: 'update ShiftPlan set actualQuantity = actualQuantity - 1 where doctorId = ? and day =? and shiftPeriod = ?',
        updateRegistration: "update Registration set ? where id = ?"
    }
}
